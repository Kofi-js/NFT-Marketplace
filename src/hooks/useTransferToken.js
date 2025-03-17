import { useCallback } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { Contract } from "ethers";
import NFT_ABI from "../ABI/nft.json";
import { getEthersSigner } from "../config/wallet-connection/adapter";
import { isSupportedNetwork } from "../utils";
import { toast } from 'react-toastify';
import { useAppContext } from "../contexts/appContext";

const useTransferToken = () => {
    const { address } = useAccount();
    const chainId = useChainId();
    const wagmiConfig = useConfig();
    const { fetchOwnedTokens } = useAppContext();
    
    return useCallback(async (tokenId, recipientAddress) => {
        if (!recipientAddress) {
            toast.error("Please enter recipient address");
            return false;
        }
        if (!address) {
            toast.error("Please connect your wallet");
            return false;
        }
        if (!isSupportedNetwork(chainId)) {
            toast.error("Unsupported network");
            return false;
        }

        // Validate recipient address format
        if (!recipientAddress.startsWith("0x")) {
            toast.error("Please enter a valid Ethereum address");
            return false;
        }
        
        
            const signer = await getEthersSigner(wagmiConfig);
            const contract = new Contract(
                import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
                NFT_ABI,
                signer
            );

            try {
            const tx = await contract.transferFrom(address, recipientAddress, tokenId);
            const receipt = await tx.wait();

            
            if (receipt.status === 0) {
                throw new Error("Transaction failed");
            } 
            toast.success("Token transferred successfully");
            // Refresh owned tokens after transfer
            await fetchOwnedTokens(contract, address);
            
            return true;
        } catch (error) {
            toast.error("Failed to transfer token: " + (error.reason || error.message));
            return false;
        }
    }, [address, chainId, fetchOwnedTokens, wagmiConfig]);
};

export default useTransferToken; 