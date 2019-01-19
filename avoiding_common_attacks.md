# Avoiding Common Attacks

### Integer Overflow / Underflow

To avoid integer over- or undeflows during arithmetic operations the SafeMath library was
implemented, which automatically throws when an overflow occurs.

### Denial of Service

To avoid looping over arrays of an unknown size and thus risking a denial of service attack, stores
and items are stored in a mapping that maps from a bytes32 key to a store/item struct. The keys are
stored in a dynamic, unordered array (ID list).

When an item (or store) is created, it gets stored inside the mapping and the key is appended to the
ID list. The index of the item inside the ID list is stored inside the item.

To delete an item without iterating over the entire ID list, the index gets retreived from the
struct. Afterwards the last key of the ID list gets copied to said index overwriting the to be
deleted item key. Then, the array length is reduced by one, deleting the last item key. Lastly the
item that got copied to the new index, needs to have the index inside its struct updated.

### Withdrawal Pattern

Proceeds from a purchase do not get pushed to the store owner immediately but get stored in a
withdrawal variable. This way a store owner can safely withdraw their earnings.

### Force Send Ether

The contract is safe against force sent Ether, but they can't be retreived.

### Reentrancy

The withdrawal function is safe against reentrancy attacks by setting the balance to zero, before
sending any ethers.
