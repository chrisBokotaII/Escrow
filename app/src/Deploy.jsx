import { ethers } from "ethers";
import Escrow from "./artifacts/contracts/Escrow.sol/Escrow.json";

export default async function deploy(signer, arbiter, beneficiary, value) {
  try {
    if (!signer || !arbiter || !beneficiary || value === undefined) {
      throw new Error("Missing required parameters");
    }

    const Factory = new ethers.ContractFactory(
      Escrow.abi,
      Escrow.bytecode,
      signer
    );

    const escrow = await Factory.deploy(arbiter, beneficiary, { value });

    escrow.arbiter = arbiter;
    escrow.beneficiary = beneficiary;
    escrow.value = ethers.formatEther(value);
    escrow.approved = false;

    return escrow;
  } catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
  }
}
