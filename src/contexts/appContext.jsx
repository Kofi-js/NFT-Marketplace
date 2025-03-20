import { Contract, Interface } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { getReadOnlyProvider } from "../utils";
import NFT_ABI from "../ABI/nft.json";
import MULTICALL_ABI from "../ABI/multicallAbi.json";
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

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const contractInterface = new Interface(NFT_ABI);
        const multicall = new Contract(
          import.meta.env.VITE_MULTICALL_ADDRESS,
          MULTICALL_ABI,
          getReadOnlyProvider()
        );

        const calls = [
          {
            target: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            callData: contractInterface.encodeFunctionData("nextTokenId", []),
          },
          {
            target: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            callData: contractInterface.encodeFunctionData("maxSupply", []),
          },
          {
            target: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            callData: contractInterface.encodeFunctionData("baseTokenURI", []),
          },
          {
            target: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            callData: contractInterface.encodeFunctionData("mintPrice", []),
          },
        ];

        console.log("calls:", calls);

        const results = await multicall.aggregate.staticCall(calls);

        // const resultArray = JSON.parse(JSON.stringify(results))[1];
        const resultArray = results[1];

        const nextTokenId = contractInterface.decodeFunctionResult(
          "nextTokenId",
          resultArray[0]
        );

        const maxSupply = contractInterface.decodeFunctionResult(
          "maxSupply",
          resultArray[1]
        );

        const baseTokenURI = contractInterface.decodeFunctionResult(
          "baseTokenURI",
          resultArray[2]
        );

        const mintPrice = contractInterface.decodeFunctionResult(
          "mintPrice",
          resultArray[3]
        );

        setNextTokenId(nextTokenId);
        setMaxSupply(maxSupply);
        setBaseTokenURI(baseTokenURI);
        setMintPrice(mintPrice);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchContractData();
  }, []);

  // useEffect(() => {

  // // Initial state setup
  // const setupInitialState = async () => {
  //     await fetchContractState(contract);
  //     if (address) {
  //         await fetchOwnedTokens(contract, address);
  //     }
  // };

  // setupInitialState();

  // Event listeners
  //     const handleTransfer = async (from, to) => {
  //         await fetchContractState(contract);

  //         // If current user is involved in the transfer, update their owned tokens
  //         if (address) {
  //             const userAddress = address.toLowerCase();
  //             const fromAddress = from.toLowerCase();
  //             const toAddress = to.toLowerCase();

  //             if (fromAddress === userAddress || toAddress === userAddress) {
  //                 await fetchOwnedTokens(contract, address);
  //             }
  //         }
  //     };

  //     const handleMinted = async (to, tokenId) => {
  //         console.log(`Minted event: to=${to}, tokenId=${tokenId}`);
  //         // Update the nextTokenId state directly based on the event
  //         setNextTokenId(Number(tokenId) + 1);
  //         // Also refresh contract state
  //         await fetchContractState(contract);

  //         // If minted to current user, update their owned tokens
  //         if (address && to.toLowerCase() === address.toLowerCase()) {
  //             console.log("NFT minted to current user, refreshing owned tokens...");
  //             await fetchOwnedTokens(contract, address);
  //         }
  //     };

  //     // Cleanup event listeners
  //     return () => {
  //         contract.off("Transfer", handleTransfer);
  //         contract.off("Minted", handleMinted);
  //     };
  // }, [address]);

  // // Watch for address changes
  // useEffect(() => {
  //     if (address) {
  //         const contract = getContract();
  //         fetchOwnedTokens(contract, address);
  //     } else {
  //         setOwnedTokens([]);
  //     }
  // }, [address]);

  useEffect(() => {
    if (!maxSupply || !baseTokenURI) return;

    // const tokenIds = Array.from({ length: Number(maxSupply) }, (_, i) => i);

    const tokenIds = [];
    for (let i = 0; i < maxSupply; i++) {
      tokenIds.push(i);
    }

    const promises = tokenIds.map((id) => {
      return fetch(`${baseTokenURI}${id}.json`)
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => {
          console.error(`Error fetching metadata for token ${id}:`, error);
          return {
            name: `Token #${id}`,
            description: "Metadata not available",
            image: "",
          };
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

  useEffect(() => {
    const contract = new Contract(
      import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      getReadOnlyProvider()
    );

    const handleMinted = async (to, tokenId) => {
      console.log(`NFT tokenId=${tokenId} mintedto=${to}, `);

      contract
        .nextTokenId()
        .then((nextTokenId) => setNextTokenId(nextTokenId))
        .catch((error) => {
          console.error("Error fetching next token ID:", error);
        });
    };
    contract.on("Minted", handleMinted);

    return () => {
      contract.off("Minted", handleMinted);
    };
  }, []);

  useEffect(() => {
    if (!address || !nextTokenId) return;
    fetchOwnedTokens();
  }, [address, nextTokenId]);

  const fetchOwnedTokens = async () => {
    try {
      const multicall = new Contract(
        import.meta.env.VITE_MULTICALL_ADDRESS,
        MULTICALL_ABI,
        getReadOnlyProvider()
      );

      const contractInterface = new Interface(NFT_ABI);

      const tokenIds = Array.from({ length: Number(nextTokenId) }, (_, i) => i);

      const calls = tokenIds.map((id) => ({
        target: import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
        callData: contractInterface.encodeFunctionData("ownerOf", [id]),
      }));

      const results = await multicall.aggregate.staticCall(calls);

    //   const encodedResults = JSON.parse(JSON.stringify(results))[1];
    // const encodedResults = results[1];
    
const encodedResults = JSON.parse(JSON.stringify(results, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ))[1];

      const decodedResult = encodedResults.map(
        (result) =>
          contractInterface.decodeFunctionResult("ownerOf", result)[0]
      );

      const isOwnedArray = decodedResult
        .map((addr, index) =>
          addr.toLowerCase() === address.toLowerCase() ? index : null
        )
        .filter((i) => i !== null);

      setOwnedTokens(isOwnedArray);
    } catch (error) {
      console.error("Error fetching owned tokens:", error);
    }
  };


  const handleTransfer = async (tokenId, to) => {
    try {
        const signer = await getEthersSigner(wagmiConfig);
        if(!signer) throw new Error("Wallet not connected");

        const contract = new Contract(
            import.meta.env.env.VITE_NFT_CONTRACT_ADDRESS,
            NFT_ABI,
            signer
        );

        const tx = await contract.transferFrom(await signer.getAddress(), to, tokenId)
        await tx.wait()

        console.log(`Token ${tokenId} transferred to ${to}`);
        setOwnedTokens((prevOwnedTokens) => prevOwnedTokens.filter((id) => id !== tokenId));
    } catch (error) {
        console.error("Error transferring token:", error);
    }
    handleTransfer(tokenId);
  }

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
      }}
    >
      {children}
    </appContext.Provider>
  );
};
