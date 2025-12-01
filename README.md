# ChainResilience: A Blockchain-Based Disaster Recovery Training Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-blue.svg)](https://docs.soliditylang.org/)
[![Truffle](https://img.shields.io/badge/Truffle-Framework-brown.svg)](https://trufflesuite.com/)

## Abstract

ChainResilience is a decentralized application (DApp) designed to facilitate disaster recovery training through blockchain technology. By leveraging the immutability and transparency of Ethereum smart contracts, this platform ensures secure, verifiable, and tamper-proof training records for disaster preparedness programs.

## Table of Contents

- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contract Design](#smart-contract-design)
- [Testing](#testing)
- [Future Scope](#future-scope)
- [Contributors](#contributors)
- [References](#references)
- [License](#license)

## Introduction

Disaster recovery training is critical for organizations and communities to build resilience against natural and man-made catastrophes. Traditional training management systems often suffer from centralization issues, data tampering risks, and lack of transparency. This project addresses these challenges by implementing a blockchain-based solution. 

## Problem Statement

1. **Lack of Transparency**: Conventional training records can be easily manipulated
2. **Centralized Storage**: Single points of failure in traditional databases
3. **Verification Challenges**: Difficulty in authenticating training certifications
4. **Accessibility Issues**: Limited access to training records across organizations

## Proposed Solution

ChainResilience utilizes Ethereum blockchain to:

- Store training records immutably on-chain
- Provide transparent and verifiable training certifications
- Enable decentralized access to training data
- Ensure data integrity through cryptographic hashing

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Web3.js)                      │
├─────────────────────────────────────────────────────────────┤
│                     Smart Contract Layer                     │
│              (DisasterRecoveryTraining.sol)                  │
├─────────────────────────────────────────────────────────────┤
│                   Ethereum Blockchain                        │
│                    (Ganache/Testnet)                         │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| Blockchain | Ethereum |
| Smart Contract | Solidity |
| Development Framework | Truffle Suite |
| Frontend | HTML5, CSS3, JavaScript |
| Web3 Integration | Web3. js v4. 16.0 |
| Local Blockchain | Ganache |
| Development Server | lite-server |

## Installation

### Prerequisites

- Node.js (v14. x or higher)
- npm (v6.x or higher)
- Truffle Suite
- Ganache (GUI or CLI)
- MetaMask Browser Extension

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/PranjalBasak/baDApp.git
   cd baDApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Ganache**
   - Launch Ganache and create a new workspace
   - Ensure it runs on `http://127.0.0.1:7545`

4. **Compile smart contracts**
   ```bash
   truffle compile
   ```

5. **Deploy contracts to local blockchain**
   ```bash
   truffle migrate --reset
   ```

6. **Configure MetaMask**
   - Connect MetaMask to Ganache network
   - Import test accounts from Ganache

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Access the application**
   - Open browser and navigate to `http://localhost:3000`

## Usage

1. Connect your MetaMask wallet to the application
2. Register for disaster recovery training programs
3. Complete training modules
4. Receive blockchain-verified certifications
5.  View and verify training records on-chain

## Smart Contract Design

The `DisasterRecoveryTraining.sol` contract implements the following core functionalities:

- **Training Registration**: Users can register for training programs
- **Progress Tracking**: Monitor training completion status
- **Certification Issuance**: Automated certificate generation upon completion
- **Record Verification**: Public verification of training credentials

### Contract Structure

```solidity
contract DisasterRecoveryTraining {
    // State variables for training management
    // Structs for trainee and program data
    // Events for tracking state changes
    // Functions for CRUD operations
}
```

## Testing

Run the test suite using:

```bash
truffle test
```

Tests are located in the `/test` directory and cover:
- Contract deployment
- Training registration
- Certification issuance
- Access control mechanisms

## Future Scope

1. **Multi-chain Deployment**: Extend to other EVM-compatible chains
2. **IPFS Integration**: Store training materials on decentralized storage
3. **Mobile Application**: Develop cross-platform mobile interface
4. **AI-Powered Analytics**: Implement training effectiveness analysis
5. **DAO Governance**: Community-driven training program management

## Contributors

- **Pranjal Basak** - *Developer & Researcher*

## References

1.  Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System
2. Buterin, V. (2014). Ethereum White Paper
3.  Truffle Suite Documentation - https://trufflesuite.com/docs/
4. Web3.js Documentation - https://web3js.readthedocs.io/
5. Solidity Documentation - https://docs.soliditylang.org/

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <i>Developed as part of academic research in Blockchain Technology and Disaster Management</i>
</p>
