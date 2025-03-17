import { Contract } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { getReadOnlyProvider } from "../utils";
import NFT_ABI from "../ABI/nft.json";
import { useAccount } from "wagmi";

const appContext = createContext();

export const useAppContext = () => {
    const context = useContext(appContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }

    return context;
};

export const AppProvider = ({ children }) => {
    const [nextTokenId, setNextTokenId] = useState(null);
    const [maxSupply, setMaxSupply] = useState(null);
    const [baseTokenURI, setBaseTokenURI] = useState("");
    const [tokenMetaData, setTokenMetaData] = useState(new Map());
    const [mintPrice, setMintPrice] = useState(null);
    const [ownedTokens, setOwnedTokens] = useState([]);
    const { address } = useAccount();

    const getContract = () => {
        return new Contract(
            import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            NFT_ABI,
            getReadOnlyProvider()
        );
    };

    // Function to fetch owned tokens
    const fetchOwnedTokens = async (contract, walletAddress = address) => {
        if (!walletAddress) {
            console.log("No wallet address provided for fetchOwnedTokens");
            return [];
        }

        try {
            // Use the provided contract or get a new one
            const nftContract = contract || getContract();
            
            // First check the user's balance (how many NFTs they own)
            console.log(`Calling balanceOf for ${walletAddress}...`);
            const balance = await nftContract.balanceOf(walletAddress);
            const balanceNumber = Number(balance);
            
            if (balanceNumber === 0) {
                console.log("User owns 0 NFTs, clearing owned tokens state");
                setOwnedTokens([]);
                return [];
            }
            
            // Fetch each token by index
            const tokens = [];
            for (let i = 0; i < balanceNumber; i++) {
                try {
 
                    const tokenId = await nftContract.tokenOfOwnerByIndex(walletAddress, i);
                    tokens.push(Number(tokenId));
                } catch (err) {
                    console.error("Error fetching token:", err);
                }
            }
            
            // As a backup, also try to check direct ownership for recently minted tokens
            if (nextTokenId !== null) {
                for (let id = 0; id < nextTokenId; id++) {
                    if (!tokens.includes(id)) {
                        try {
                            const owner = await nftContract.ownerOf(id);
                            if (owner.toLowerCase() === walletAddress.toLowerCase()) {
                                if (!tokens.includes(id)) {
                                    tokens.push(id);
                                }
                            }
                        } catch (err) {
                            // Ignore errors here - likely token doesn't exist or is owned by someone else
                        }
                    }
                }
            }
            
            // Sort the tokens by ID before setting state
            tokens.sort((a, b) => a - b);
            setOwnedTokens(tokens);
            return tokens;
        } catch (error) {
            console.error("❌ Error fetching owned tokens:", error);
            return [];
        }
    };

    // Function to fetch contract state
    const fetchContractState = async (contract) => {
        try {
            // Use the provided contract or get a new one
            const nftContract = contract || getContract();
            
            const id = await nftContract.nextTokenId();
            const uri = await nftContract.baseTokenURI();
            const supply = await nftContract.maxSupply();
            const price = await nftContract.mintPrice();
            
            setNextTokenId(Number(id));
            setBaseTokenURI(uri);
            setMaxSupply(Number(supply));
            setMintPrice(price);
            
            return { id, uri, supply, price };
        } catch (error) {
            console.error("Error fetching contract state:", error);
            return null;
        }
    };

    useEffect(() => {
        const contract = getContract();

        // Initial state setup
        const setupInitialState = async () => {
            await fetchContractState(contract);
            if (address) {
                await fetchOwnedTokens(contract, address);
            }
        };

        setupInitialState();

        // Event listeners
        const handleTransfer = async (from, to) => {
            await fetchContractState(contract);
            
            // If current user is involved in the transfer, update their owned tokens
            if (address) {
                const userAddress = address.toLowerCase();
                const fromAddress = from.toLowerCase();
                const toAddress = to.toLowerCase();
                
                if (fromAddress === userAddress || toAddress === userAddress) {
                    await fetchOwnedTokens(contract, address);
                }
            }
        };

        const handleMinted = async (to, tokenId) => {
            console.log(`Minted event: to=${to}, tokenId=${tokenId}`);
            // Update the nextTokenId state directly based on the event
            setNextTokenId(Number(tokenId) + 1);
            // Also refresh contract state
            await fetchContractState(contract);
            
            // If minted to current user, update their owned tokens
            if (address && to.toLowerCase() === address.toLowerCase()) {
                console.log("NFT minted to current user, refreshing owned tokens...");
                await fetchOwnedTokens(contract, address);
            }
        };

        // Cleanup event listeners
        return () => {
            contract.off("Transfer", handleTransfer);
            contract.off("Minted", handleMinted);
        };
    }, [address]);

    // Watch for address changes
    useEffect(() => {
        if (address) {
            const contract = getContract();
            fetchOwnedTokens(contract, address);
        } else {
            setOwnedTokens([]);
        }
    }, [address]);

    useEffect(() => {
        if (!maxSupply || !baseTokenURI) return;

        const tokenIds = Array.from({ length: Number(maxSupply) }, (_, i) => i);
        const promises = tokenIds.map((id) => {
            return fetch(`${baseTokenURI}${id}.json`)
                .then((response) => response.json())
                .then((data) => data)
                .catch(error => {
                    console.error(`Error fetching metadata for token ${id}:`, error);
                    return { name: `Token #${id}`, description: "Metadata not available", image: "" };
                });
        });

        Promise.all(promises)
            .then((responses) => {
                const tokenMetaData = new Map();
                responses.forEach((response, index) => {
                    tokenMetaData.set(index, response);
                });
                setTokenMetaData(tokenMetaData);
            })
            .catch((error) => console.error("Error loading metadata: ", error));
    }, [baseTokenURI, maxSupply]);

    return (
        <appContext.Provider
            value={{
                nextTokenId,
                maxSupply,
                baseTokenURI,
                tokenMetaData,
                mintPrice,
                ownedTokens,
                fetchOwnedTokens,
                getContract,
            }}
        >
            {children}
        </appContext.Provider>
    );
};
