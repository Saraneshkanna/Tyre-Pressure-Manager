// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TyrePressureMonitor 
{
    // Stores the current tyre pressure reading for each tyre
    mapping(uint8 => uint16) public tyrePressureReadings;
    //mapping(uint8 => uint16) public tyrePressureAlertThresholds;
    uint16 public tyrePressureAlertThreshold;
    mapping(uint8 => uint16[]) public tyrePressureHistory;


    // Event emitted when a tyre's pressure reading is updated
    event TyrePressureUpdated(uint8 tyreIndex, uint16 newPressure);
    event TyrePressureAlert(uint8 tyreIndex, uint16 currentPressure);

    // Modifier that ensures the tyre index is valid (0-3)
    modifier validTyreIndex(uint8 tyreIndex) 
    {
        require(tyreIndex < 4, "Invalid tyre index");
        _;
    }
    function setPressureThreshold(uint16 PresThres) public
    {
        tyrePressureAlertThreshold = PresThres;
    }

    function getTyrePressureThreshold() public view returns (uint) 
    {
        // Return the current threshold value
        return tyrePressureAlertThreshold;
    }

    // Function to update the tyre pressure reading for a given tyre
    function updateTyrePressure(uint8 tyreIndex, uint16 newPressure) public validTyreIndex(tyreIndex) 
    {
        uint16 oldPressure = tyrePressureReadings[tyreIndex];
        tyrePressureReadings[tyreIndex] = newPressure;
        tyrePressureHistory[tyreIndex].push(newPressure);
        // Check if the new pressure falls below the alert threshold
        if (newPressure < tyrePressureAlertThreshold)
        {
            emit TyrePressureAlert(tyreIndex, newPressure);
        }
        else
        {
            emit TyrePressureUpdated(tyreIndex, newPressure);(tyreIndex, newPressure);
        }
    }

    // Function to retrieve the current tyre pressure reading for a given tyre
    function getTyrePressure(uint8 tyreIndex) public view validTyreIndex(tyreIndex) returns (uint16) 
    {
        return tyrePressureReadings[tyreIndex];
    }

    function getTyrePressureHistory(uint8 tyreIndex) public view validTyreIndex(tyreIndex) returns (uint16[] memory)
    {
        return tyrePressureHistory[tyreIndex];
    }
}

