import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositValue, setDepositValue] = useState("");
  const [withdrawValue, setWithdrawValue] = useState("");
  const [cashbackMessage, setCashbackMessage] = useState("");
  const [totalCashback, setTotalCashback] = useState(0);
  const [transactionLimit, setTransactionLimit] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set, get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      const currentTransactionLimit = await atm.transactionLimit();
      const depositAmount = parseInt(depositValue, 10);

      if (depositAmount > currentTransactionLimit) {
        alert("Deposit amount exceeds the set transaction limit.");
        return;
      }

      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(withdrawValue);
      await tx.wait();
      getBalance();
    }
  };

  const checkCashback = () => {
    if (balance > 1000) {
      setCashbackMessage("Congratulations! You won cashback of 100.");
      setTotalCashback((prevCashback) => prevCashback + 100);
    } else if (balance > 500) {
      setCashbackMessage("Congratulations! You won cashback of 50.");
      setTotalCashback((prevCashback) => prevCashback + 50);
    } else {
      setCashbackMessage("Sorry, no cashback for you this time.");
    }
  };

  const checkTotalCashback = () => {
    setCashbackMessage(`Total Cashback Earned: ${totalCashback}`);
  };

  const setLimit = async () => {
    if (atm && transactionLimit > 0) {
      let tx = await atm.setTransactionLimit(transactionLimit);
      await tx.wait();
      console.log("Transaction limit set successfully");
    }
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <>
          <button onClick={connectAccount}>Connect Metamask Wallet</button>
        </>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input
          type="text"
          placeholder="Deposit Amount"
          value={depositValue}
          onChange={(e) => setDepositValue(e.target.value)}
        />
        <button onClick={deposit}>Deposit</button>
        <br />
        <input
          type="text"
          placeholder="Withdraw Amount"
          value={withdrawValue}
          onChange={(e) => setWithdrawValue(e.target.value)}
        />
        <button onClick={withdraw}>Withdraw</button>
        <br />
        <input
          type="number"
          placeholder="Set Transaction Limit"
          value={transactionLimit}
          onChange={(e) => setTransactionLimit(e.target.value)}
        />
        <button onClick={setLimit}>Set Transaction Limit</button>
        <br />
        <button onClick={checkCashback}>Check Cashback</button>
        <button onClick={checkTotalCashback}>Total Cashback</button>
        <p>{cashbackMessage}</p>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
