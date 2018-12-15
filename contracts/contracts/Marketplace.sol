pragma solidity 0.4.24;
// pragma experimental ABIEncoderV2;

// removed ethpm package, because of solc issues
// import "zeppelin/contracts/math/SafeMath.sol";

/// @title SafeMath
/// @dev Math operations with safety checks that throw on error
library SafeMath {

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
    
}

/// @title Marketplace
/// @author Daniel Gretzke
contract Marketplace {

    using SafeMath for uint256;
    // owner, admin, storeOwner variables
    address public owner;
    mapping(address => bool) public admins;
    mapping(address => bool) public storeOwners;

    // events
    event AddedAdmin(address indexed admin);
    event RemovedAdmin(address indexed admin);
    event AddedStoreOwner(address indexed storeOwner, address indexed admin);
    event RemovedStoreOwner(address indexed storeOwner, address indexed admin);
    
    event AddedStore(address indexed storeOwner, bytes32 indexed storeID);
    event RemovedStore(address indexed storeOwner, bytes32 indexed storeID);
    event AddedItem(address indexed storeOwner, bytes32 indexed storeID, bytes32 indexed itemID);
    event RemovedItem(address indexed storeOwner, bytes32 indexed storeID, bytes32 indexed itemID);

    event Purchase(address indexed storeOwner, bytes32 indexed storeID, bytes32 indexed itemID, address customer);
    event Withdrawal(address indexed storeOwner, uint256 amount);
    event Restocking(address indexed storeOwner, bytes32 indexed storeID, bytes32 indexed itemID, uint256 amount);

    // store and item structs
    struct Store {
        bytes32 storeID;
        string name;
        string description;
        // items are stored inside a mapping, mapped from a bytes32 key to an item
        mapping(bytes32 => Item) items;
        // items can be retreived via an unordered array of bytes32 keys
        bytes32[] itemIdList;
        // index inside storeIdList array for cheap deletion of stores
        uint256 index;
        bool active;
    }

    struct Item {
        bytes32 itemID;
        string name;
        string description;
        // ipfs hash (placeholder, needs to be adjusted to real ipfs hashes)
        bytes32 image;
        uint256 price;
        uint256 stock;
        // index inside itemIdList array for cheap deletion of items
        uint256 index;
        bool active;
    }
    
    // stores are stored inside a mapping, mapped from a bytes32 key to a store
    // each storeOwner has its own mapping to store stores in
    mapping(address => mapping(bytes32 => Store)) private stores;
    // stores can be retreived via an unordered array of bytes32 keys
    mapping(address => bytes32[]) private storeIdLists;
    // fixed size array to store featured storeOwners inside the marketplace
    address[10] public featuredStoreOwners;

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
            emit AddedAdmin(_newAdmin);
        }
        admins[_newAdmin] = true;
    }

    /// @notice remove administrator
    /// @dev only callable by owner
    /// @param _admin address of account to be removed as administrator
    function removeAdmin(address _admin) external onlyOwner {
        // only emit event if admin is not removed yet
        if (admins[_admin]) {
            emit RemovedAdmin(_admin);
        }
        admins[_admin] = false;
    }

    /// @notice add shopowner
    /// @dev only callable by admins
    /// @param _newStoreOwner address of account to be added as shopowner
    function addStoreOwner(address _newStoreOwner) external onlyAdmin {
        // only emit event if shopowner is not added yet
        if (!storeOwners[_newStoreOwner]) {
            emit AddedStoreOwner(_newStoreOwner, msg.sender);
        }
        storeOwners[_newStoreOwner] = true;
    }

    /// @notice remove shopowner
    /// @dev only callable by admins
    /// @param _storeOwner address of account to be removed as shopowner
    function removeStoreOwner(address _storeOwner) external onlyAdmin {
        // only emit event if shopowner is not removed yet
        if (storeOwners[_storeOwner]) {
            emit RemovedStoreOwner(_storeOwner, msg.sender);
        }
        storeOwners[_storeOwner] = false;
    }

    /// @notice adds a new store
    /// @dev only callable by store owners, throws on duplicate store ID per store owner
    /// @param _name name of store
    /// @param _description description of store
    /// @return generated bytes32 ID of store 
    function addStore(string _name, string _description) public onlyStoreOwner returns(bytes32 storeID) {
        // generate pseudorandom ID out of name, msg.sender and timestamp
        storeID = keccak256(abi.encodePacked(_name, msg.sender, now));
        
        // storage pointers to store and store id list
        Store storage store = stores[msg.sender][storeID];
        bytes32[] storage storeIdList = storeIdLists[msg.sender];

        // ensure that there is no active store with same ID
        require(!store.active, "store with same id already active");

        // push newly generated ID to store id list
        // save new length -1 as index
        uint256 index = storeIdList.push(storeID).sub(1);

        // generate new store in stores mapping
        stores[msg.sender][storeID] = Store({
            storeID: storeID,
            name: _name,
            description: _description,
            itemIdList: new bytes32[](0),
            index: index,
            active: true
        });

        emit AddedStore(msg.sender, storeID);
    }

    /// @notice removes an existing store
    /// @dev only callable by store owners, requires store to be active
    /// @param _storeID ID of store to be removed
    /// @return true on success, false on failure
    function removeStore(bytes32 _storeID) public onlyStoreOwner returns(bool) {
        // storage pointers to store and store id list
        Store storage store = stores[msg.sender][_storeID];
        bytes32[] storage storeIdList = storeIdLists[msg.sender];
        
        // store has to be active in order to be removed
        require(store.active, "store currently not active");
        
        // copy last index of store id list to index of to be removed store and delete last item of array
        storeIdList[store.index] = storeIdList[storeIdList.length-1];
        // remove items from store
        store.itemIdList.length = 0;
        store.active = false;

        emit RemovedStore(msg.sender, _storeID);
        return true;
    }

    /// @notice add an item to a store
    /// @dev only callable by store owners, requires parent store to be active, throws on duplicate item ID per store
    /// @param _storeID ID of store 
    /// @param _name name of item
    /// @param _description description of item
    /// @param _price price of item
    /// @param _image image of item (ipfs hash)
    /// @param _stock available quantity for purchase
    /// @return generated bytes32 ID of item
    function addItem(
        bytes32 _storeID,
        string _name,
        string _description,
        uint256 _price,
        bytes32 _image,
        uint256 _stock
    ) public onlyStoreOwner returns(bytes32 itemID) {
        // generate pseudorandom ID out of name, msg.sender and timestamp
        itemID = keccak256(abi.encodePacked(_name, msg.sender, now));
        
        // storage pointers to item and item id list
        Item storage item = stores[msg.sender][_storeID].items[itemID];
        bytes32[] storage itemIdList = stores[msg.sender][_storeID].itemIdList;
        
        // ensure that parent store is active
        require(stores[msg.sender][_storeID].active, "store is not active");
        // ensure that there is no active item with same ID
        require(!item.active, "item with same id already active");

        // push newly generated ID to item id list
        // save new length -1 as index
        uint256 index = itemIdList.push(itemID).sub(1);

        // generate new item in items mapping
        stores[msg.sender][_storeID].items[itemID] = Item({
            itemID: itemID,
            name: _name,
            description: _description,
            image: _image,
            price: _price,
            stock: _stock,
            index: index,
            active: true
        });

        emit AddedItem(msg.sender, _storeID, itemID);
    }
    
    /// @notice removes an existing item
    /// @dev only callable by store owners, requires item to be active
    /// @param _storeID ID of store
    /// @param _itemID ID of item to be removed
    /// @return true on success, false on failure
    function removeItem(bytes32 _storeID, bytes32 _itemID) public onlyStoreOwner returns(bool) {
        // storage pointers to item and item id list
        Item storage item = stores[msg.sender][_storeID].items[_itemID];
        bytes32[] storage itemIdList = stores[msg.sender][_storeID].itemIdList;

        // ensure that parent store is active
        require(stores[msg.sender][_storeID].active, "store is not active");
        // item has to be active in order to be removed
        require(item.active, "store currently not active");
        
        // copy last index of item id list to index of to be removed item and delete last item of array
        itemIdList[item.index] = itemIdList[itemIdList.length-1];
        item.active = false;

        emit RemovedItem(msg.sender, _storeID, _itemID);
        return true;
    }

    /// @notice purchases item
    /// @param _storeOwner address of storeOwner+
    /// @param _storeID ID of store
    /// @param _itemID ID of item
    /// @return true on successful purchase, false on failure
    function purchase(address _storeOwner, bytes32 _storeID, bytes32 _itemID) public payable returns (bool) {
        // storage pointer to item
        Item storage item = stores[_storeOwner][_storeID].items[_itemID];
        // check if provided value matches price
        require(msg.value == item.price, "sent value does not match price");
        // check if item is available
        require(item.stock > 0, "item out of stock");
        item.stock -= 1;
        // credit storeOwner
        balances[_storeOwner] = balances[_storeOwner].add(msg.value);

        emit Purchase(_storeOwner, _storeID, _itemID, msg.sender);
        return true;
    }

    /// @notice allows withdrawal of balance
    /// @param _amount amount to withdraw
    /// @return true on success, false on failure
    function withdraw(uint256 _amount) public returns (bool) {
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        msg.sender.transfer(_amount);
        emit Withdrawal(msg.sender, _amount);
        return true;
    }
    
    /// @notice restocks quantity of an item
    /// @param _storeID ID of store
    /// @param _itemID ID of item
    /// @param _amount amount to restock
    /// @return true on success, false on failure
    function restock(bytes32 _storeID, bytes32 _itemID, uint256 _amount) public onlyStoreOwner returns(bool) {
        // storage pointer to item
        Item storage item = stores[msg.sender][_storeID].items[_itemID];
        item.stock = item.stock.add(_amount);
        emit Restocking(msg.sender, _storeID, _itemID, _amount);
        return true;
    }
    
    /// @notice return list of stores belonging to a store owner
    /// @param _storeOwner address of store owner
    /// @return bytes32 array, containing IDs of stores belonging to store owner 
    function getStoreIdList(address _storeOwner) public view returns(bytes32[]) {
        return storeIdLists[_storeOwner];
    }

    /// @notice return store by store ID belonging to a store owner
    /// @param _storeOwner address of store owner
    /// @param _storeID bytes32 ID of store
    /// @return name of store
    /// @return description of store
    /// @return bytes32 array of item IDs belongig to store
    /// @return index of store in store id list
    function getStore(address _storeOwner, bytes32 _storeID) public view returns(
        string name, 
        string description, 
        bytes32[] itemIdList, 
        uint256 index
    ) {
        Store memory store = stores[_storeOwner][_storeID];
        name = store.name;
        description = store.description;
        itemIdList = store.itemIdList;
        index = store.index;
    }

    /// @notice return item list of store belonging to a store owner
    /// @param _storeOwner address of store owner
    /// @param _storeID bytes32 ID of store
    /// @return bytes32 array, containing item IDs of a store belonging to store owner 
    function getItemIdList(address _storeOwner, bytes32 _storeID) public view returns(bytes32[]) {
        return stores[_storeOwner][_storeID].itemIdList;
    }

    /// @notice return item of a store belonging to a store owner
    /// @param _storeOwner address of store owner
    /// @param _storeID bytes32 ID of store
    /// @return name of item
    /// @return description of item
    /// @return ipfs hash of image
    /// @return price of item
    /// @return index of item in item id list
    function getItem(address _storeOwner, bytes32 _storeID, bytes32 _itemID) public view returns(
        string name,
        string description,
        bytes32 image,
        uint256 price,
        uint256 index
    ) {
        Item memory item = stores[_storeOwner][_storeID].items[_itemID];
        name = item.name;
        description = item.description;
        image = item.image;
        price = item.price;
        index = item.index;
    }

}