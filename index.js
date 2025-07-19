const express = require("express");
const dotenv = require("dotenv");
const { AuthorizationCode } = require("simple-oauth2");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const config = {
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://github.com",
    tokenPath: "/login/oauth/access_token",
    authorizePath: "/login/oauth/authorize",
  },
};

const client = new AuthorizationCode(config);

app.get("/auth", (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: `${req.query.site}/api/auth/callback`,
    state: req.query.state,
  });
  res.redirect(authorizationUri);
});

app.get("/auth/callback", async (req, res) => {
  const tokenParams = {
    code: req.query.code,
    redirect_uri: `${req.query.site}/api/auth/callback`,
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    const token = accessToken.token.access_token;
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Authentication failed", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`OAuth server running on port ${port}`));
