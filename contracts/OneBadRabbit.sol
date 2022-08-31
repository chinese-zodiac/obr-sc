// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract OneBadRabbit is
    Ownable,
    AccessControlEnumerable,
    ERC721Enumerable,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    bytes32 public constant RECRUITER_ROLE = keccak256("RECRUITER_ROLE");

    Counters.Counter private _tokenIdTracker;

    uint256 public cap = 100;
    string public dat_dir =
        "ipfs://QmYeWi4DVNiGatPsVf4zNFebgM3NnhkMvAMzaiaXj85sCo/obr-dat/";

    constructor() ERC721("One Bad Rabbit", "1BAD") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * See {ERC721-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `RECRUITER_ROLE`.
     */
    function recruit(address _for) external onlyRole(RECRUITER_ROLE) {
        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        uint256 newTokenId = _tokenIdTracker.current();
        if (newTokenId == 0) {
            _tokenIdTracker.increment();
            newTokenId = _tokenIdTracker.current();
        }
        require(newTokenId <= cap, "OBR: Cannot mint id above cap");
        _mint(_for, newTokenId);
        _tokenIdTracker.increment();
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(tokenId), "1BAD: URI query for nonexistent token");

        return string(abi.encodePacked(dat_dir, tokenId, ".json"));
    }

    function setDatDir(string calldata _to) external onlyOwner {
        dat_dir = _to;
    }

    function setCap(uint256 _to) external onlyOwner {
        cap = _to;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable, ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
