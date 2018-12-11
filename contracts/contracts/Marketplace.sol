pragma solidity 0.4.24;

/// @title Marketplace
/// @author Daniel Gretzke
contract Marketplace {
    
    // owner, admin, storeOwner variables
    address public owner;
    mapping(address => bool) public admins;
    mapping(address => bool) public storeOwners;

    // events
    event addedAdmin(address indexed admin);
    event removedAdmin(address indexed admin);
    event addedStoreOwner(address indexed storeOwner, address indexed admin);
    event removedStoreOwner(address indexed storeOwner, address indexed admin);
    
    event addedStore(address indexed storeOwner, uint256 storeID);
    event removedStore(address indexed storeOwner, uint256 storeID);
    event addedItem(address indexed storeOwner, uint256 storeID, uint256 itemID);
    event removedItem(address indexed storeOwner, uint256 storeID, uint256 itemID);

    // store and item structs
    struct Store {
        bytes32 storeID;
        string name;
        string description;
        address owner;
        // items are stored inside a mapping, mapped from a bytes32 key to an item
        mapping(bytes32 => Item) items;
        // items can be retreived via an unordered array of bytes32 keys
        bytes32[] itemIdList;
        // index inside storeIdList array for cheap deletion of stores
        uint256 index;
    }

    struct Item {
        string name;
        string description;
        // ipfs hash (placeholder, needs to be adjusted to real ipfs hashes)
        bytes32 image;
        uint256 price;
        // index inside itemIdList array for cheap deletion of items
        uint256 index;
    }
    
    // stores are stored inside a mapping, mapped from a bytes32 key to a store
    // each storeOwner has its own mapping to store stores in
    mapping(address => mapping(bytes32 => Store)) private stores;
    // stores can be retreived via an unordered array of bytes32 keys
    mapping(address => bytes32[]) private storeIdLists;

    // balances of storeOwners
    mapping(address => uint256) public balances;

    /// @dev modifier, verifies that caller is owner
    modifier onlyOwner() {
        require(owner == msg.sender, "caller is not owner");
        _;
    }

    /// @dev modifier, verifies that caller is admin
    modifier onlyAdmin() {
        require(admins[msg.sender], "caller is not admin");
        _;
    }

    /// @dev modifier, verifies that caller is store owner
    modifier onlyStoreOwner() {
        require(storeOwners[msg.sender], "caller is not store owner");
        _;
    }
    
    /// @dev constructor 
    constructor() public {
        owner = msg.sender;
    }

    /// @notice add administrator
    /// @dev only callable by owner
    /// @param _newAdmin address of account to be added as administrator
    function addAdmin(address _newAdmin) external onlyOwner {
        // only emit event if admin is not added yet
        if (!admins[_newAdmin]) {
            emit addedAdmin(_newAdmin);
        }
        admins[_newAdmin] = true;
    }

    /// @notice remove administrator
    /// @dev only callable by owner
    /// @param _admin address of account to be removed as administrator
    function removeAdmin(address _admin) external onlyOwner {
        // only emit event if admin is not removed yet
        if (admins[_admin]) {
            emit removedAdmin(_admin);
        }
        admins[_admin] = false;
    }

    /// @notice add shopowner
    /// @dev only callable by admins
    /// @param _newStoreOwner address of account to be added as shopowner
    function addStoreOwner(address _newStoreOwner) external onlyAdmin {
        // only emit event if shopowner is not added yet
        if (!storeOwners[_newStoreOwner]) {
            emit addedStoreOwner(_newStoreOwner, msg.sender);
        }
        storeOwners[_newStoreOwner] = true;
    }

    /// @notice remove shopowner
    /// @dev only callable by admins
    /// @param _storeOwner address of account to be removed as shopowner
    function removeStoreOwner(address _storeOwner) external onlyAdmin {
        // only emit event if shopowner is not removed yet
        if (storeOwners[_storeOwner]) {
            emit removedStoreOwner(_storeOwner, msg.sender);
        }
        storeOwners[_storeOwner] = false;
    }
    
}