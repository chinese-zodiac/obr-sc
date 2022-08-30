// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./OneBadRabbit.sol";
import "./czodiac/LuckyRabbitToken.sol";

contract OneBadRabbitSale is Ownable {
    OneBadRabbit public oneBadRabbit;
    LuckyRabbitToken public lrt =
        LuckyRabbitToken(0xE95412D2d374B957ca7f8d96ABe6b6c1148fA438);

    mapping(address => uint256) public accountRecruited;

    mapping(address => bool) public whitelist;
    uint256 public whitelistRecruitmentCap = 2;

    uint256 public globalRecruitmentCap = 100;
    uint256 public totalRecruited;

    uint256 public whitelistStartEpoch;
    uint256 public publicStartEpoch;

    uint256 public lrtRecruitmentFee = 25 ether;

    constructor(OneBadRabbit _oneBadRabbit) {
        oneBadRabbit = _oneBadRabbit;
    }

    function recruitBadRabbit() external {
        require(totalRecruited < globalRecruitmentCap, "OBR: All Recruited");
        require(
            block.timestamp >= whitelistStartEpoch,
            "OBR: Recruitment not open"
        );
        require(
            block.timestamp >= publicStartEpoch ||
                (whitelist[msg.sender] &&
                    accountRecruited[msg.sender] < whitelistRecruitmentCap),
            "OBR: Not whitelist eligible"
        );

        totalRecruited++;
        accountRecruited[msg.sender]++;
        oneBadRabbit.recruit(msg.sender);
    }

    function updateWhitelist(address _addr, bool _val) public onlyOwner {
        // Update the value at this address
        whitelist[_addr] = _val;
    }

    function setWhitelistedAll(address[] calldata _addr) public onlyOwner {
        for (uint256 i = 0; i < _addr.length; i++) {
            updateWhitelist(_addr[i], true);
        }
    }

    function setWhitelistCap(uint256 _to) external onlyOwner {
        whitelistRecruitmentCap = _to;
    }

    function setLrtRecruitmentFee(uint256 _to) external onlyOwner {
        lrtRecruitmentFee = _to;
    }

    function setGlobalRecruitmentCap(uint256 _to) external onlyOwner {
        globalRecruitmentCap = _to;
    }

    function setWhitelistStartEpochAndDuration(
        uint256 _whitelistStartEpoch,
        uint256 _publicStartEpoch
    ) external onlyOwner {
        publicStartEpoch = _publicStartEpoch;
        whitelistStartEpoch = _whitelistStartEpoch;
    }
}
