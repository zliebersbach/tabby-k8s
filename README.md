# `tabby-k8s` | Tabby Kubernetes Plugin

## Overview

This repository contains a Kubernetes plugin for [Tabby](https://tabby.sh), a modern terminal emulator. The plugin provides seamless integration with Kubernetes, allowing users to interact with containers in their Kubernetes clusters directly from Tabby.

## Features

- **Attach to Containers**: Easily interact with containers in Kubernetes clusters.
- _SOON_ **Multiple Contexts**: Connect to containers across multiple Kubernetes contexts.
- _SOON_ **Custom Shell**: Set a custom shell for Kubernetes sessions.

## Installation

To install the `tabby-k8s` plugin, follow these steps:

1. Ensure you have Tabby installed. You can download it from [here](https://tabby.sh).
2. Clone this repository:
    ```sh
    git clone https://github.com/zliebersbach/tabby-k8s.git
    ```
3. Navigate to the cloned directory:
    ```sh
    cd tabby-k8s
    ```
4. Build the plugin:
    ```sh
    yarn build
    ```
5. Launch Tabby with the plugin (macOS):
    ```sh
    TABBY_PLUGINS=$(pwd) /Applications/Tabby.app/Contents/MacOS/Tabby
    ```

## Usage

Once installed, you can access the Kubernetes plugin from the Tabby interface. Open the "Profiles & connections" window and choose a running container from the currently active Kubernetes context to start a terminal session.

## Contributing

We welcome contributions to the `tabby-k8s` plugin! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

Shout-out to the contributors of Tabby for their continuous efforts.
