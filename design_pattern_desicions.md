# Design Pattern Decisions

I will briefly go over the design patterns suggested in the course and my reasoning on why I did or
didn't implement them.

### Fail early, fail loud

Implemented, as throwing an exception is always preferrable to a silent fail

### Restricting access

Implemented, as the marketplace is built around many different roles, it makes sense restricting
function access to specific roles.

### Auto deprecation

Not implemented, as I don't think an auto deprecation is necessary. If someone finds this repo in 2
years I still wan't them to be able to check out the rinkeby demo.

### Circuit Breaker

Implemented, in case something goes wrong and a bug is detected, the smart contract can be paused,
until a solution is found. Functions not affected by the circuit break are view / pure functions and
the withdraw function.

### Mortal

Not implemented, as I think that selfdestucting a smart contract comes with risk, especially if this
smart contract accepts Ether. In case a smart contract selfdestructs and someone calls the purchase
function, the ethers sent to the contract are gone for ever. A circuit breaker that disables the
smart contract is a better decision in my optinion. Implementing the mortal design pattern would
also enable the theft of all ethers inside the smart contract (store owner balances) by the owner of
the contract.

### Pull over Push Payments

Implemented, as it increases the security of the smart contract. It would be too easy to attack a
smart contract otherwise.

### State Machine

Not implemented, as there aren't any stages inside the smart contract.

### Speed bump

Not implemented, as not deemed necessary
