import React, { useCallback } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { useAppContext } from "../contexts/appContext";
import { Contract } from "ethers";
import NFT_ABI from "../ABI/nft.json";
import { getEthersSigner } from "../config/wallet-connection/adapter";
import { isSupportedNetwork } from "../utils";
import { toast } from 'react-toastify';
// import { config } from "../config/wallet-connection/wagmi";

const useMintToken = () => {
    const { address } = useAccount();
    const chainId = useChainId();
    const wagmiConfig = useConfig();
    const { nextTokenId, maxSupply, mintPrice } = useAppContext();
    
    return useCallback(async () => {
        if (!address) {
            toast.error("Please connect your wallet");
            return;
        }
        if (!isSupportedNetwork(chainId)) {
            toast.error("Unsupported network");
            return;
        }
        if (nextTokenId >= maxSupply) {
            toast.error("No more tokens to mint");
            return;
        }

        const signer = await getEthersSigner(wagmiConfig);
        const contract = new Contract(
            import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            NFT_ABI,
            signer
        );

        try {
            const tx = await contract.mint({ value: mintPrice });
            const receipt = await tx.wait();
            if (receipt.status === 0) {
                throw new Error("Transaction failed");
            }

            // Get the minted token ID from the event
            const mintedEvent = receipt.events.find(event => event.name === "Minted" || 
                                                  (event.event === "Minted"));
            if (mintedEvent) {
                const tokenId = Number(mintedEvent.args.tokenId);
                toast.success(`Token #${tokenId} minted successfully!`);
                return tokenId;
            } else {
                // Fallback to Transfer event if Minted event not found
                const transferEvent = receipt.events.find(event => 
                    event.name === "Transfer" || 
                    (event.event === "Transfer" && 
                     event.args[0] === "0x0000000000000000000000000000000000000000"));
                
                if (transferEvent) {
                    const tokenId = Number(transferEvent.args[2] || transferEvent.args.tokenId);
                    toast.success(`Token #${tokenId} minted successfully!`);
                    return tokenId;
                } else {
                    toast.success("Token minted successfully!");
                    return null;
                }
            }
        } catch (error) {
            console.error("Minting error:", error);
            toast.error(error.message || "Failed to mint token");
        }
    }, [address, chainId, maxSupply, mintPrice, nextTokenId, wagmiConfig]);
};

export default useMintToken;
