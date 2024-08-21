# BlockBird

BlockBird is a comprehensive Chrome extension that offers a suite of tools for blockchain and Web3 enthusiasts. It provides features such as a scanner for airdrops and points systems, a searchable list of blockchain explorers, wallet management, and more. The extension also supports dark mode and customizable settings.

## Features

- **Dashboard**: Quick access to all features and updates.
- **Scanner**: Scan the current webpage for keywords related to airdrops, points, and rewards.
- **Explorers**: Searchable list of blockchain explorers with pagination.
- **Wallets**: Manage your crypto wallets for easy copy/paste.
- **Solana Tokens**: View the most recently added Solana tokens from Jupiter.
- **Settings**: Customize the default page and toggle dark mode.

## Installation

1. Clone or download the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the upper right corner.
4. Click "Load unpacked" and select the directory where you cloned/downloaded the repository.

## Usage

### Dashboard

- Provides quick access to all features.
- Displays recent updates and advertisements.

### Scanner

1. Navigate to the "Scanner" page.
2. Click "Scan Now" to scan the current webpage for keywords like "airdrop", "points", and "rewards".
3. View the scan results and highlighted keywords directly on the webpage.

### Explorers

1. Navigate to the "Explore" page.
2. Use the search bar to filter blockchain explorers.
3. Click on the blockchain to be taken to its block explorer.

### Wallets

1. Navigate to the "Wallets" page.
2. Add new wallets by entering a label and address, then click "Add".
3. Manage wallets by editing, deleting, or copying the address to the clipboard.

### Solana Tokens

1. Navigate to the "Tokens" page.
2. View the most recently added Solana tokens, according to Jupiter (jup.ag).
3. Each token displays its name, symbol, address, and market cap.

### Settings

1. Navigate to the "Settings" page.
2. Select your preferred default page.
3. Toggle dark mode on or off.

## Development

### File Structure

- `manifest.json`: Extension configuration and permissions.
- `popup.html`: Main dashboard of the extension.
- `scanner.html`, `scanner.js`: Scanner feature implementation.
- `explorers.html`, `explorers.js`: Blockchain explorers feature implementation.
- `wallets.html`, `wallets.js`: Wallet management feature implementation.
- `tokens.html`, `solana-tokens.js`: Solana tokens feature implementation.
- `settings.html`, `settings.js`: Settings page implementation.
- `styles.css`: Shared styles for the extension.
- `include-links.js`: Script to populate navigation links.
- `links.html`: HTML file containing navigation links.
- `dark-mode.js`: Script to toggle dark mode.
- `default-page.js`: Script to handle default page redirection.

### Contributing

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and ensure they are well-tested.
4. Commit your changes with a descriptive message.
5. Push your branch to your forked repository.
6. Create a pull request to the main repository.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support or inquiries, join our [Telegram group](https://t.me/blockbirdchat).
