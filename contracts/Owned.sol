pragma solidity ^0.4.13;


contract Owned {
    /**
     * Event emitted when a new owner has been set.
     * @param previousOwner The previous owner, who happened to effect the change.
     * @param newOwner The new, and current, owner the contract.
     */
    address private contractOwner;

    event LogOwnerSet(address indexed previousOwner, address indexed newOwner);
    modifier fromOwner { require(msg.sender == contractOwner); _; }

    function Owned()
    {
        contractOwner = msg.sender;
    }
    /**
     * Sets the new owner for this contract.
     *   - only the current owner can call this function
     *   - only a new address can be accepted
     *   - only a non-0 address can be accepted
     * @param newOwner The new owner of the contract
     * @return Whether the action was successful.
     * Emits LogOwnerSet.
     */
    function setOwner(address newOwner)
        fromOwner
        returns(bool success)
    {
        require(newOwner != 0);

        address currentOwner = contractOwner;
        if (currentOwner != newOwner) {
            LogOwnerSet(currentOwner, newOwner);
            contractOwner = newOwner;
            return true;
        }
        return false;
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner() constant returns(address owner)
    {
        return contractOwner;
    }
}