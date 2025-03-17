import { Icon } from "@iconify/react/dist/iconify.js";
import { formatEther } from "ethers";
import React, { useState } from "react";
import { truncateString } from "../../utils";
import { useAppContext } from "../../contexts/appContext";

const NFTCard = ({ metadata, mintPrice, tokenId, nextTokenId, mintNFT }) => {
  const [isMinting, setIsMinting] = useState(false);
  const { ownedTokens } = useAppContext();

  const isMinted = Number(tokenId) < Number(nextTokenId);
  const isNextToMint = Number(tokenId) === Number(nextTokenId);
  const isOwned = ownedTokens.some((id) => Number(id) === Number(tokenId));

  const handleMint = async () => {
    if (!isNextToMint) return;

    setIsMinting(true);
    try {
      await mintNFT();
    } catch (error) {
      console.error("Mint error:", error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="hover-card card-shine bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 relative">
      {/* Image container with overlay */}
      <div className="relative overflow-hidden aspect-square group">
        <img
          src={metadata.image}
          alt={`${metadata.name} image`}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          loading="lazy"
        />
        
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out`}
        >
          <div className="text-white">
            <h3 className="font-bold text-lg">{metadata.name}</h3>
            <div className="flex items-center mt-2">
              <Icon icon="ri:ethereum-fill" className="w-4 h-4 mr-1" />
              <span className="font-medium">{formatEther(mintPrice)} ETH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-gray-900 truncate flex-1">
            {metadata.name}
          </h2>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {truncateString(metadata.description, 80)}
        </p>

        <div className="flex gap-2 pb-2">
          <Icon icon="ri:file-list-3-line" className="w-6 h-6" />
          <span>{metadata.attributes.length} Attributes</span>
        </div>

        <div className="flex gap-2 pb-2">
          <Icon icon="ri:eth-line" className="w-6 h-6" />
          <span>{`${formatEther(mintPrice)} ETH`}</span>
        </div>

        <button
          disabled={!isNextToMint || isOwned || isMinting}
          onClick={handleMint}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
            isNextToMint && !isOwned && !isMinting
              ? "bg-gradient-primary hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isMinting ? (
            <>
              <Icon icon="ri:loader-2-line" className="w-5 h-5 animate-spin" />
              <span>Minting...</span>
            </>
          ) : isMinted ? (
            <>
              <Icon icon="ri:lock-line" className="w-5 h-5" />
              <span>Already Minted</span>
            </>
          ) : (
            <>
              <Icon icon="ri:shopping-cart-line" className="w-5 h-5" />
              <span>Mint NFT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NFTCard;
