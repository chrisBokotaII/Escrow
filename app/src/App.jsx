// ... (imports and provider setup)
import { ethers } from "ethers";
import deploy from "./Deploy";
import { useState, useEffect } from "react";
import "./App.css";
import Escrow from "./artifacts/contracts/Escrow.sol/Escrow.json";

const provider = window.ethereum
  ? new ethers.BrowserProvider(window.ethereum)
  : null;

if (!provider) {
  console.error("Ethereum provider not found");
  // Handle this case accordingly
}
export default function App() {
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState("");
  const [contractList, setContractList] = useState([]);
  const [signer, setSigner] = useState("");
  const [form, setForm] = useState({
    arbiter: "",
    beneficiary: "",
    value: "",
  });

  useEffect(() => {
    // Load the list of contracts from localStorage on component mount
    const savedContractList =
      JSON.parse(localStorage.getItem("contractList")) || [];
    setContractList(savedContractList);

    async function getAccount() {
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setSigner(await provider.getSigner());
    }

    getAccount();
  }, []);

  useEffect(() => {
    async function getBalance() {
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
    }

    getBalance();
  }, [account]);

  useEffect(() => {
    // Save the updated contract list to localStorage whenever it changes
    localStorage.setItem("contractList", JSON.stringify(contractList));
  }, [contractList]);

  const handlechange = (value) => {
    setForm({
      ...form,
      [value.target.name]: value.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { arbiter, beneficiary, value } = form;
      const wei = ethers.parseEther(value);
      const tx = await deploy(signer, arbiter, beneficiary, wei);

      // Update the contract list with the new transaction
      setContractList([...contractList, tx]);
    } catch (error) {
      console.error("Error deploying contract:", error);
    }
  };

  const handleApprove = async (index) => {
    try {
      const contract = new ethers.Contract(
        contractList[index].target,
        Escrow.abi,
        provider
      );
      console.log(contract);
      const tx = await contract.connect(signer).approve();

      console.log(tx);

      const updatedList = [...contractList];
      updatedList[index] = { ...updatedList[index], approved: true };
      setContractList(updatedList);
      setForm({
        arbiter: "",
        beneficiary: "",
        value: "",
      });
    } catch (error) {
      console.error("Error approving contract:", error);
    }
  };

  return (
    <div className="app">
      <div className="account">
        <p>account: {account}</p>
        <p>balance: {balance} ETH</p>
      </div>
      <div className="deploy">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="arbiter"
            name="arbiter"
            onChange={handlechange}
            value={form.arbiter}
          />
          <input
            type="text"
            placeholder="beneficiary"
            name="beneficiary"
            onChange={handlechange}
            value={form.beneficiary}
          />
          <input
            type="text"
            placeholder="value"
            name="value"
            onChange={handlechange}
            value={form.value}
          />
          <input type="submit" />
        </form>
      </div>
      <div className="existing">
        <table>
          <thead>
            <tr>
              <th>Arbiter</th>
              <th>Beneficiary</th>
              <th>Value</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contractList.map((contract, index) => (
              <tr key={index}>
                <td>{contract.arbiter}</td>
                <td>{contract.beneficiary}</td>
                <td>{contract.value}</td>
                <td>{contract.approved ? "Yes" : "No"}</td>
                <td>
                  {!contract.approved && (
                    <button
                      onClick={() => handleApprove(index)}
                      disabled={contract.approved}
                      className=" btn {index}"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
