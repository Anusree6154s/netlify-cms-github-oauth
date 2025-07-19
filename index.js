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
  const siteUrl = new URL(req.query.site);
  const cleanSite = `${siteUrl.origin}${siteUrl.pathname}`;
  const authorizationUri = client.authorizeURL({
    redirect_uri: `${cleanSite}/api/auth/callback`,
    state: req.query.state || "netlify-cms-dev",
  });
  res.redirect(authorizationUri);
});

app.get("/auth/callback", async (req, res) => {
  const siteUrl = new URL(req.query.site);
  const cleanSite = `${siteUrl.origin}${siteUrl.pathname}`;
  const tokenParams = {
    code: req.query.code,
    redirect_uri: `${cleanSite}/api/auth/callback`,
    state: req.query.state || "netlify-cms-dev",
  };

  try {
    const accessToken = await client.getToken(tokenParams);
    const token = accessToken.token.access_token;
    res.json({ token });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Authentication failed", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`OAuth server running on port ${port}`));
