import Head from 'next/head'
// import getPosts from '../hooks/getPosts'
// import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from "axios";
// import Post from "../models/post";
import Web3Modal from 'web3modal';
import WalletConnectProvider from "@walletconnect/web3-provider";

const contractAddress = "0x0cdD1E3fC1f4eeedaBc27bC2e06152795d755A6b"

const abi = [
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_toAddress",
				"type": "address"
			}
		],
		"name": "addTransaction",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_stakeAmount",
				"type": "uint256"
			}
		],
		"name": "addValidator",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "blockTransactions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "fromAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "toAddress",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "blockchain",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "nonce",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "validator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "numoftrxns",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_validator",
				"type": "address"
			}
		],
		"name": "chooseValidator",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "decreaseStake",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "increaseStake",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "mine",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nonce",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amt",
				"type": "uint256"
			}
		],
		"name": "sendViaCall",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "transactions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "fromAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "toAddress",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "users",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "validator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawStake",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]


export default function Home() {
    // const [input, setInput] = useState("");
    const [price, setPrice] = useState("");
    
    async function createPost() {
      const web3Modal = new Web3Modal({
          cacheProvider: true,
          providerOptions: {
              walletconnect: {
                  package: WalletConnectProvider,
              }
            },
      });
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      let tx = {
        to: contractAddress,
        value: ethers.utils.parseEther(price, 'ether')
      };
    
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);
      // await tx.wait();
      try {
        // to send to smart contract
        const transaction = await signer.sendTransaction(tx);        
        console.log(transaction)
        console.log()
        // to execute some method which is there in contract
        const addValidator = await contractWithSigner.addValidator(price);
        const addingValidator = await addValidator.wait()
        console.log(addingValidator)

        console.log(await contractWithSigner.users(addingValidator.from))

        alert("Validator added successfully "+ addingValidator.from )

      } catch (error) {
        alert(error.code)
        console.log(error)
      }

    }
    

    return (
        <div className="">
        <Head>
        <title>Social dApp</title>
        <meta name="description" content="Simple web3 dapp" />
        <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="">
        <div className="">
        <h1>Add validator</h1>
        <input placeholder='Price' className="" value={price} onChange={(e) => setPrice(e.target.value)} />
        <div onClick={createPost} className="p-4">Add</div>
        </div>
        </main>
        </div>
    )
}