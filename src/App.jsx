import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useAppContext } from "./contexts/appContext";
import NFTCard from "./components/NFTCard";
import OwnedTokens from "./components/OwnedTokens";
import useMintToken from "./hooks/useMintToken";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Contract } from "ethers";
import NFT_ABI from "./ABI/nft.json";
import { getReadOnlyProvider } from "./utils";

function App() {
  const {
    nextTokenId,
    tokenMetaData,
    mintPrice,
    ownedTokens,
    fetchOwnedTokens,
  } = useAppContext();
  const [activeTab, setActiveTab] = useState("marketplace");
  const mintToken = useMintToken();

  // Get all tokens and separate them by ownership
  const allTokens = Array.from(tokenMetaData.entries()).map(
    ([tokenId, metadata]) => ({
      tokenId: Number(tokenId),
      metadata,
    })
  );

  // Show all NFTs in marketplace that are not owned
  const marketplaceTokens = allTokens.filter(
    (token) => !ownedTokens.includes(token.tokenId)
  );

  // Sort NFTs by token ID to ensure proper display order
  marketplaceTokens.sort((a, b) => a.tokenId - b.tokenId);

  // Refresh owned tokens when tab changes to "owned"
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    // If switching to owned tab, refresh owned tokens
    if (tabId === "owned") {
      console.log("App: Switching to owned tab, refreshing owned tokens");
      const contract = new Contract(
        import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        getReadOnlyProvider()
      );
      fetchOwnedTokens(contract);
    }
  };

  // Auto-switch to owned tab when first NFT is acquired
  useEffect(() => {
    if (
      ownedTokens.length > 0 &&
      activeTab === "marketplace" &&
      !localStorage.getItem("hasViewedOwnedNFTs")
    ) {
      // Only auto-switch once
      const timer = setTimeout(() => {
        handleTabChange("owned");
        localStorage.setItem("hasViewedOwnedNFTs", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [ownedTokens, activeTab]);

  const tabs = [
    { id: "marketplace", label: "Marketplace", icon: "ri:store-2-line" },
    { id: "owned", label: "My NFTs", icon: "ri:gallery-line" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Discover, collect, and sell extraordinary NFTs
              </h1>
              <p className="text-white/80 text-lg mb-8 max-w-xl">
                Our NFT marketplace is a decentralized platform where creators
                and collectors come together to buy, sell, and discover unique
                digital assets.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleTabChange("marketplace")}
                  className="px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:shadow-lg hover:shadow-black/10 transition-all flex items-center gap-2"
                >
                  <Icon icon="ri:shopping-bag-3-line" className="w-5 h-5" />
                  Explore Marketplace
                </button>
                <button
                  onClick={() => handleTabChange("owned")}
                  className="px-6 py-3 border border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Icon icon="ri:user-line" className="w-5 h-5" />
                  My Collection
                </button>
              </div>
            </div>
            <div className="w-full max-w-md">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-full h-full bg-primary-dark rounded-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-full h-full bg-primary/50 rounded-xl"></div>
                <div className="relative bg-white p-6 rounded-xl shadow-xl overflow-hidden card-shine">
                  <div className="grid grid-cols-2 gap-4">
                    {allTokens.slice(0, 4).map(({ tokenId, metadata }) => (
                      <div
                        key={tokenId}
                        className="rounded-lg overflow-hidden shadow-sm hover-card aspect-square"
                      >
                        <img
                          src={metadata.image}
                          alt={metadata.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white ite border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center py-2">
              <span className="text-gray-500 text-sm mb-1">Total NFTs</span>
              <span className="text-2xl font-bold text-gray-900">
                {allTokens.length}
              </span>
            </div>
            <div className="flex flex-col items-center py-2">
              <span className="text-gray-500 text-sm mb-1">Minted</span>
              <span className="text-2xl font-bold text-gray-900">
                {nextTokenId || 0}
              </span>
            </div>
            <div className="flex flex-col items-center py-2">
              <span className="text-gray-500 text-sm mb-1">Available</span>
              <span className="text-2xl font-bold text-gray-900">
                {marketplaceTokens.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 flex-grow">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-md p-1.5 flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 font-medium text-base ${
                  activeTab === tab.id
                    ? "bg-gradient-primary text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon icon={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.id === "owned" && ownedTokens.length > 0 && (
                  <span
                    className={`bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      activeTab !== "owned" && ownedTokens.length > 0
                        ? "animate-pulse"
                        : ""
                    }`}
                  >
                    {ownedTokens.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {activeTab === "marketplace" && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Available NFTs
                </h2>
                {nextTokenId !== null && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <Icon
                      icon="ri:information-line"
                      className="w-5 h-5 text-primary"
                    />
                    <span>
                      Next token to mint:{" "}
                      <span className="font-medium">#{nextTokenId}</span> •{" "}
                      {marketplaceTokens.length} available NFTs
                    </span>
                  </div>
                )}
              </div>

              {marketplaceTokens.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="animate-float">
                    <Icon
                      icon="ri:shopping-bag-line"
                      className="w-20 h-20 text-gray-300 mx-auto mb-4"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No NFTs Available
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    There are no NFTs available for minting at the moment. Check
                    back later or view your owned NFTs.
                  </p>
                  {ownedTokens.length > 0 && (
                    <button
                      onClick={() => handleTabChange("owned")}
                      className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-md transition-all"
                    >
                      View My Collection
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {marketplaceTokens.map(({ tokenId, metadata }) => (
                      <NFTCard
                        key={tokenId}
                        metadata={metadata}
                        mintPrice={mintPrice.toString()}
                        tokenId={tokenId}
                        nextTokenId={nextTokenId}
                        mintNFT={mintToken}
                      />
                    ))}
                  </div>

                  {nextTokenId && nextTokenId >= allTokens.length && (
                    <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start gap-3">
                      <Icon
                        icon="ri:alert-line"
                        className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          All NFTs have been minted
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          All available NFTs in this collection have been
                          minted. You can still browse the marketplace or view
                          your owned NFTs.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "owned" && <OwnedTokens />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
