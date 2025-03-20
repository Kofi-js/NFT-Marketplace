import { useState, useEffect } from "react";
import { useAppContext } from "../contexts/appContext";
import { useAccount } from "wagmi";
import { Contract, formatEther } from "ethers";
import NFT_ABI from "../ABI/nft.json";
import { getReadOnlyProvider } from "../utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import { truncateString } from "../utils";
import useTransferToken from "../hooks/useTransferToken";

const OwnedTokens = () => {
  const { ownedTokens, tokenMetaData, fetchOwnedTokens, mintPrice } = useAppContext();
  const { address } = useAccount();
  const [transferAddress, setTransferAddress] = useState("");
  const [selectedToken, setSelectedToken] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const transferToken = useTransferToken();

  useEffect(() => {
    if (address) {
      refreshOwnedTokens();
    }
  }, [address]);

  const refreshOwnedTokens = async () => {
    if (!address) return;

    setIsRefreshing(true);
    try {
      const contract = new Contract(
        import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        getReadOnlyProvider()
      );
      console.log(
        "OwnedTokens: Calling fetchOwnedTokens with contract and address:",
        address
      );
      await fetchOwnedTokens(contract, address);
    } catch (error) {
      console.error("Error refreshing tokens:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTransfer = async (tokenId) => {
    setIsTransferring(true);
    try {
      const success = await transferToken(tokenId, transferAddress);
      if (success) {
        setTransferAddress("");
        setSelectedToken(null);
      }
    } finally {
      setIsTransferring(false);
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg shadow-inner">
        <div className="animate-float">
          <Icon
            icon="ri:wallet-3-line"
            className="w-20 h-20 text-gray-300 mb-4"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Wallet Not Connected
        </h3>
        <p className="text-gray-600 max-w-md text-center mb-6">
          Connect your wallet to view your NFT collection and manage your
          digital assets.
        </p>
        <button className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My NFT's</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshOwnedTokens}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
            title="Refresh your NFT collection"
          >
            <Icon
              icon={isRefreshing ? "ri:loader-2-line" : "ri:refresh-line"}
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {ownedTokens.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="animate-float">
            <Icon
              icon="ri:nft-line"
              className="mx-auto w-20 h-20 text-gray-300 mb-4"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No NFTs Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You don't own any NFTs from this collection yet. Head to the
            Marketplace to discover and mint your first NFT!
          </p>

          <button
            onClick={() => (window.location.hash = "marketplace")}
            className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-medium shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {ownedTokens.map((tokenId) => {
            const metadata = tokenMetaData.get(Number(tokenId));
            if (!metadata) return null;

            return (
              <div
                key={tokenId}
                className="hover-card card-shine bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div className="relative overflow-hidden group">
                  <img
                    src={metadata.image}
                    alt={`${metadata.name} image`}
                    className="w-full h-64 object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-gray-900 truncate flex-1">
                      {metadata.name}
                    </h2>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {truncateString(metadata.description, 80)}
                  </p>

                  <div className="flex gap-2 pb-2">
                    <Icon icon="ri:file-list-3-line" className="w-6 h-6" />
                    <span>{metadata.attributes.length} Attributes</span>
                  </div>

                  <div className="flex gap-2 pb-2">
                    <Icon icon="ri:eth-line" className="w-6 h-6" />
                    <span>{`${formatEther(mintPrice[0])} ETH`}</span>
                  </div>

                  {/* Transfer section */}
                  {selectedToken === tokenId ? (
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg -mx-1 mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Transfer to:
                      </p>
                      <input
                        type="text"
                        placeholder="Recipient address (0x...)"
                        value={transferAddress}
                        onChange={(e) => setTransferAddress(e.target.value)}
                        className="w-full p-2 border rounded mb-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTransfer(tokenId)}
                          disabled={isTransferring || !transferAddress}
                          className="flex-1 flex justify-center items-center gap-2 bg-gradient-primary text-white py-2 px-4 rounded hover:shadow-md disabled:opacity-50 transition-all"
                        >
                          {isTransferring ? (
                            <>
                              <Icon
                                icon="ri:loader-2-line"
                                className="animate-spin w-4 h-4"
                              />
                              <span>Sending</span>
                            </>
                          ) : (
                            <>
                              <Icon
                                icon="ri:send-plane-fill"
                                className="w-4 h-4"
                              />
                              <span>Send</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedToken(null);
                            setTransferAddress("");
                          }}
                          className="bg-gray-200 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedToken(tokenId)}
                      className="w-full bg-gradient-primary text-white py-3 hover:shadow-md transition-all flex items-center justify-center gap-2 rounded-lg"
                    >
                      <Icon icon="ri:send-plane-line" className="w-4 h-4" />
                      <span>Transfer NFT</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Modal */}
      {selectedToken !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-float">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Transfer NFT #{selectedToken}
              </h3>
              <button
                onClick={() => {
                  setSelectedToken(null);
                  setTransferAddress("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="ri:close-line" className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Enter the wallet address you want to transfer this NFT to:
              </p>
              <input
                type="text"
                placeholder="Recipient address (0x...)"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleTransfer(selectedToken)}
                disabled={isTransferring || !transferAddress}
                className="flex-1 bg-gradient-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {isTransferring ? (
                  <>
                    <Icon
                      icon="ri:loader-2-line"
                      className="animate-spin w-5 h-5"
                    />
                    <span>Processing Transfer...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="ri:send-plane-fill" className="w-5 h-5" />
                    <span>Transfer NFT</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedToken(null);
                  setTransferAddress("");
                }}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnedTokens;
