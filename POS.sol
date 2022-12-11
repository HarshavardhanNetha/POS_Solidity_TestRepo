// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

contract POS{

    address admin;
    mapping(address => uint) public users;
    address public validator;
    uint public nonce = 0;
    address[] public allUsers;
    uint public totalUsers = 0;

    struct Transaction{
        uint amount;
        address fromAddress;
        address toAddress;
    }

    struct Block{
        uint nonce;
        address validator;
        uint numoftrxns;
    }
    
    Transaction[] public transactions;

    mapping(uint => Block) public blockchain;
    // for blocktransactions, the parameters are nonce and index of transactionsArray
    // as it is a mapping of uint and trxArray
    mapping(uint => Transaction[]) public blockTransactions;


    constructor () payable {
        admin = msg.sender;
        blockchain[nonce] = Block({nonce: nonce,validator: admin, numoftrxns: 0});
        nonce+=1;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier onlyValidator() {
        require(msg.sender == validator, "Only choosen validator can mine.");
        _;
    }

    modifier onlyUser() {
        require(users[msg.sender] != 0, "Only registered users can execute this method.");
        _;
    }

    function sendViaCall(address _to, uint amt) public payable {
        uint amtInEth = amt * 1e18;
        (bool sent, bytes memory data) = payable(_to).call{value: amtInEth}("");
        require(sent, "Failed to send Ether");
    }
    
    receive() external payable { }

    function addValidator(uint _stakeAmount) public payable returns(bool) {
        // CALL FOR ETH TRANSFER
        allUsers.push(msg.sender);
        totalUsers+=1;
        users[msg.sender] = _stakeAmount;
        return true;
    }

    function addTransaction(uint amount, address _toAddress)public returns(bool){
        // CALL FOR ETH TRANSFER
        transactions.push(Transaction({amount:amount,fromAddress: msg.sender, toAddress: _toAddress}));
        return true;
    }


    function increaseStake(uint value) onlyUser public payable {
        // CALL FOR ETH TRANSFER
        users[msg.sender] += value;
    }

    function decreaseStake(uint value) onlyUser public payable {
        require(value<users[msg.sender], "No enough stake");
        sendViaCall(msg.sender, value);
        users[msg.sender] -= value; 
    }

    function withdrawStake() onlyUser public payable {
        sendViaCall(msg.sender,users[msg.sender]);
        delete users[msg.sender];
        // delete user from allUsers array
        // reduce total users number
        totalUsers -= 1;
    }


    function chooseValidator(address _validator) public payable onlyAdmin {
        require(users[_validator] > 0,"Choosen address isn't in the registered users.");
        validator = _validator;
    }

    function mine() public onlyValidator {
        // (bool sentToBeValidator, bytes memory dataValidator) = payable(admin).call{value: _stakeAmount}("");
        uint arrayLength = transactions.length;
        uint i;

        for (i=0; i<arrayLength; i++) {
            sendViaCall(transactions[i].toAddress,transactions[i].amount);
        }

        blockTransactions[nonce] = transactions;
        blockchain[nonce] = Block({nonce: nonce,validator: validator, numoftrxns: i});

        nonce += 1;
        delete transactions;

        validator = 0x0000000000000000000000000000000000000000;
    }
}