pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MasterShef {

    struct UserInfo{
        uint256 stakingBalance;
        uint256 startTime;
        uint256 rewordsBalance;
    }

    uint256 public apy = 400;

    mapping(address => UserInfo) public userInfo;
    IERC20 public token;
    IERC20 public lpToken;

    event Stake(address indexed from, uint256 amount);
    event Unstake(address indexed from, uint256 amount);
    event Claim(address indexed to, uint256 amount);

    constructor(address _token, address _lpToken) {
        token = IERC20(_token);
        lpToken = IERC20(_lpToken);
    }

    function stake(uint256 _amount) public {
        require(_amount > 0 && IERC20(lpToken).balanceOf(msg.sender) >= _amount, "You dont have enough tokens");

        IERC20(lpToken).transferFrom(msg.sender, address(this), _amount);
        userInfo[msg.sender].stakingBalance += _amount;
        userInfo[msg.sender].startTime = block.timestamp;
        emit Stake(msg.sender, _amount);
    }

    function getStakingBalance() public view returns (uint){
        return userInfo[msg.sender].stakingBalance;
    }

    function timeStaking(address _user) public view returns(uint256) {
        uint totalTime = block.timestamp - userInfo[_user].startTime;
        return totalTime;
    }

    function totalReward(address _user) public view returns(uint256) {
        uint256 amountReward = timeStaking(_user) / 31536000 * userInfo[_user].stakingBalance * apy / 100;
        return amountReward; 
    }

    function claim() public {

        require(totalReward(msg.sender) > 0 || userInfo[msg.sender].rewordsBalance > 0, "You dont have reward tokens");
        uint256 toClaim = totalReward(msg.sender);
        uint256 startBalance = token.balanceOf(address(this));

        if(userInfo[msg.sender].rewordsBalance != 0) {
            uint unclaimBalance = userInfo[msg.sender].rewordsBalance;
            toClaim += unclaimBalance;
            userInfo[msg.sender].rewordsBalance = 0;
        }

        userInfo[msg.sender].startTime = block.timestamp;
        token.transfer(msg.sender, toClaim);
        apy = apy * token.balanceOf(address(this)) / startBalance;
        emit Claim(msg.sender, toClaim);
    } 

    function unstake(uint256 _amount) public {

        require(userInfo[msg.sender].stakingBalance >= _amount, "You dont have enough stake tokens");

        uint totalReward = totalReward(msg.sender);
        
        userInfo[msg.sender].startTime = block.timestamp;

        userInfo[msg.sender].stakingBalance -= _amount;

        IERC20(lpToken).transfer(msg.sender, _amount);
        userInfo[msg.sender].rewordsBalance += totalReward;

        emit Unstake(msg.sender, _amount);
    }

}
