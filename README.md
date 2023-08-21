# tweet-arena-tool

Tool to send periodic Are.na block/link to Twitter as threads

CLI-only for now, later: deployable JSON API and Web UI!

## Usage

- Pre-requirements: run these commands in your terminal app
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

- Running the CLI tool

  - Edit the `state.json` config to desired behaviour
      ```json
      {
        "// dont actually tweet, just preview": "",
        "dryRunTweet": false,

        "// start posting blocks from": "",
        "postNewBlocksSince": "8/13/2023 10:42:00",

        "// stop posting Are.na blocks (optional)": "",
        "postNewBlocksTill": "8/15/2023 23:59:59",

        "// not used, for reference": "",
        "lastRunTime": "7/30/2023 20:42:00",
        "lastLastRunTime": "7/23/2023 21:22:00"
      } 
      ```

  - Set required env vars, in a `.env` file:
      ```sh
      echo "TWITTER_API_KEY=xxx\n" \
      "TWITTER_API_SECRET=xxx\n" \
      "TWITTER_ACCESS_TOKEN=xxx\n" \
      "TWITTER_ACCESS_SECRET=xxx\n" \
      "ARENA_PERSONAL_ACCESS_TOKEN=xxx\n" \
      "# instructions for retrieving:\n" \
      "# - https://developer.twitter.com/en/docs/tutorials/authenticating-with-twitter-api-for-enterprise/authentication-method-overview#oauth1.0a\n" \
      "# - https://dev.are.na/documentation/authentication:\n" > .env

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
