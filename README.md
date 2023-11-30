# optibook-monitor
A basic web scraper used to display team rankings for Optiver's educational trading platform, Optibook. Used for our team submission in the Optiver and Imperial Trading Academy.

## Usage

1. Install dependencies:

    ```bash
    npm i
    ```

2. Run the scraper:

    ```bash
    node index.js
    ```

3. Open in browser:
    ```bash
    open index.html
    ```
## Known Issues

While the Optibook Team Rankings Scraper is designed to be a useful tool, there are a few known issues and limitations:

1. **Limited Error Handling**: The current version of the scraper lacks comprehensive error handling. If the Optibook platform undergoes significant changes, the scraper may not function as expected.

2. **High Delay Between Updates**: Each update per stock takes roughly 1 second. As the number of traded stocks increase, the delay is too long to be accurate to represent the true value.

3. **Known Race Condition**: Due to the current implementation, there is no proper way to check whether a given instrument receives the latest data and so may take longer than the stated time to update.
