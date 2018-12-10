pragma solidity 0.5.1;

/// @title Marketplace
/// @author Daniel Gretzke
contract Marketplace {
    
    address public owner;
    mapping(address => bool) public admins;
    mapping(address => bool) public shopOwners;

    event addedAdmin(address indexed admin);
    event removedAdmin(address indexed admin);
    event addedShopOwner(address indexed shopOwner, address indexed admin);
    event removedShopOwner(address indexed shopOwner, address indexed admin);

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
    /// @param _newShopOwner address of account to be added as shopowner
    function addShopOwner(address _newShopOwner) external onlyAdmin {
        // only emit event if shopowner is not added yet
        if (!shopOwners[_newShopOwner]) {
            emit addedShopOwner(_newShopOwner, msg.sender);
        }
        shopOwners[_newShopOwner] = true;
    }

    /// @notice remove shopowner
    /// @dev only callable by admins
    /// @param _shopOwner address of account to be removed as shopowner
    function removeShopOwner(address _shopOwner) external onlyAdmin {
        // only emit event if shopowner is not removed yet
        if (shopOwners[_shopOwner]) {
            emit removedShopOwner(_shopOwner, msg.sender);
        }
        shopOwners[_shopOwner] = false;
    }
    
}