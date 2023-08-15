# tweet-arena-tool

tool to send periodic Are.na link digests to Twitter as threads

CLI-only for now, deployable JSON API later!

## Usage

- Pre-requirements
  ```sh
  # NOTE: these commands assume macOS, look for equivalent in ur OS

  # install Homebrew: https://brew.sh/
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

  # install Node.js
  brew install node@18 

  # download the tool repository, `git` should be pre-installed
  git clone git@github.com:suruleredotdev/tweet-arena-tool.git
  
  # install tool dependencies
  cd <path/to/tweet-arena-tool>
  npm install
  ```

- Running the tool

  - Edit the `state.json` config to desired behaviour
  ```json
  {
    "// not used, for reference": "",
    "dryRunTweet": false,

    "// start posting Are.na blocks": "",
    "postNewBlocksSince": "8/13/2023 10:42:00",

    "// not used, for reference": "",
    "lastRunTime": "7/30/2023 20:42:00",
    "lastLastRunTime": "7/23/2023 21:22:00"
  } 
  ```

  - Set required env vars, in a `.env` file:
      ```sh
      TWITTER_API_KEY=xxx
      TWITTER_API_SECRET=xxx
      TWITTER_ACCESS_TOKEN=xxx
      TWITTER_ACCESS_SECRET=xxx
      ARENA_PERSONAL_ACCESS_TOKEN=xxx
      # instructions for retrieving:
      # - https://developer.twitter.com/en/docs/tutorials/authenticating-with-twitter-api-for-enterprise/authentication-method-overview#oauth1.0a
      # - https://dev.are.na/documentation/authentication

      # ensure vars are exported
      export $(xargs <.env)
      ```

  - Change hardcoded constants
      ```js
      const
        ARENA_USER,  // details of your Are.na user
        ARENA_CHANNELS, // names of channels to post. defaults to @korede-ta's channels TODO: make this dynamic
        LOG_LEVEL; // expose more/less logs by saying 'DEBUG'/'INFO'. defaults to 'ERROR'
      ```

  - Run the script in CLI!
      ```sh
      node post-arena-to-twitter.js
      ```

  - [ ] TODO: Run the server for JSON/REST API
