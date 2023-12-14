import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Escrow from "./artifacts/contracts/Escrow.sol/Escrow.json";

const provider = new ethers.BrowserProvider(window.ethereum);

export default function AddContract(props) {
  const [state, setState] = useState(true);
  const { id, arbiter, beneficiary, value } = props;
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const getSigner = async () => {
      const signer = await provider.getSigner();
      setSigner(signer);
    };

    getSigner();
  }, []);

  useEffect(() => {
    const savedContractAddress = localStorage.getItem("contractAddress");

    if (savedContractAddress) {
      const savedContract = new ethers.Contract(
        savedContractAddress,
        Escrow.abi,
        provider
      );

      setContract(savedContract);
    }
  }, [contract]);

  const handleApprove = async () => {
    if (signer) {
      try {
        const tx = await contract.connect(signer).approve();
        await tx.wait();
        setState(false);
        console.log("Approval transaction successful:", tx);
      } catch (error) {
        console.error("Error approving contract:", error);
      }
    } else {
      console.error("Signer not available");
    }
  };

  const btnClass = state ? `btn btn` : `btn active`;

  return (
    <div className="existing">
      <table>
        <tr>
          <td>#ID</td>
          <td>{id}</td>
        </tr>
        <tr>
          <td>Arbiter</td>
          <td>{arbiter}</td>
        </tr>
        <tr>
          <td>Beneficiary</td>
          <td>{beneficiary}</td>
        </tr>
        <tr>
          <td>Value</td>
          <td>{value}</td>
        </tr>
        <tr>
          <button className={btnClass} onClick={handleApprove}>
            {state ? "Approve" : "Approved"}
          </button>
        </tr>
      </table>
    </div>
  );
}
