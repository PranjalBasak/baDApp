// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract DisasterRecoveryTraining {
    enum TrainingType { first_aid, shelter_rebuild, food_safety }
    struct Admin {
        uint256 id;
        string name;
        uint256 age;
        uint256 balance;
    }
    
    struct Trainer {
        uint256 id;
        string name;
        uint256 age;
        string gender;
    }
    
    struct Participant {
        uint256 id;
        string name;
        uint256 age;
        string gender;
        string district;
        TrainingType training_interest;
        bool has_completed_training;
        uint256 balance;
    }
    
    struct TrainingSlot {
        uint256 slotId;
        uint256 trainerId;
        uint256 participantId;
        bool isBooked;
    }

    uint256 private constant TOTAL_SLOTS_PER_DAY = 48;
    uint256 private constant BOOKING_FEE = 1 ether;
    uint256 private constant INITIAL_PARTICIPANT_BALANCE = 10 ether;

    mapping(uint256 => Admin) private admins;
    mapping(address => bool) private isAdmin;
    mapping(uint256 => Trainer) private trainers;
    mapping(uint256 => Participant) private participants;
    mapping(uint256 => mapping(uint256 => TrainingSlot)) private trainerSlots;
    uint256[] private adminIds;
    
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can perform this action");
        _;
    }
    
    function registerAdmin(uint256 id, string memory name, uint256 age) external returns (uint256) {
        require(age > 0, "Invalid age");
        require(id > 0, "Invalid ID");
        require(admins[id].id == 0, "Admin ID already exists");
        
        admins[id] = Admin(id, name, age, 0);
        adminIds.push(id);
        isAdmin[msg.sender] = true;
        return id;
    }
    
    function registerTrainer(uint256 id, string memory name, uint256 age, string memory gender) external returns (uint256) {
        require(age > 0, "Invalid age");
        require(id > 0, "Invalid ID");
        require(trainers[id].id == 0, "Trainer ID already exists");
        
        trainers[id] = Trainer(id, name, age, gender);
        return id;
    }
    
    function registerParticipant(
        uint256 id,
        string memory name,
        uint256 age,
        string memory gender,
        string memory district,
        uint256 training_interest,
        bool has_completed_training
    ) external returns (uint256) {
        require(age > 0, "Invalid age");
        require(id > 0, "Invalid ID");
        require(participants[id].id == 0, "Participant ID already exists");
        require(training_interest <= 2, "Invalid training interest");
        
        participants[id] = Participant(
            id,
            name,
            age,
            gender,
            district,
            TrainingType(training_interest),
            has_completed_training,
            INITIAL_PARTICIPANT_BALANCE,
            msg.sender
        );
        return id;
    }
    
    function updateParticipantData(uint256 participantId, uint256 newTrainingInterest, bool has_completed_training) external onlyAdmin {
        require(participants[participantId].id != 0, "Participant not found");
        require(newTrainingInterest <= 2, "Invalid training interest");
        
        Participant storage p = participants[participantId];
        require(!p.has_completed_training || has_completed_training, "Cannot change completed from true to false");
        
        // admin only access
        require(isdAdmin[msg.sender], "Not Authorized");
        p.training_interest = TrainingType(newTrainingInterest);
        p.has_completed_training = has_completed_training;
    }
    
    function bookTrainingSlot(uint256 trainerId, uint256 participantId, uint256 slotId) external returns (bool) {
        require(trainers[trainerId].id != 0, "Trainer not found");
        require(participants[participantId].id != 0, "Participant not found");
        require(participants[participantId].balance >= BOOKING_FEE, "Insufficient participant balance");
        require(adminIds.length > 0, "No admins available");
        require(slotId < TOTAL_SLOTS_PER_DAY, "Invalid slot ID");
        require(!trainerSlots[trainerId][slotId].isBooked, "Slot is already booked");

        trainerSlots[trainerId][slotId] = TrainingSlot(slotId, trainerId, participantId, true);

        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, participantId))) % adminIds.length;

        uint256 selectedAdminId = adminIds[randomIndex];

        participants[participantId].balance -= BOOKING_FEE;
        admins[selectedAdminId].balance += BOOKING_FEE;
        
        return true;
    }
    
    function viewAdminBalance() external view returns (uint256[] memory adminIdList, uint256[] memory balanceList) {
        uint256 totalAdmins = adminIds.length;
        
        adminIdList = new uint256[](totalAdmins);
        balanceList = new uint256[](totalAdmins);
        
        for (uint256 i = 0; i < totalAdmins; i++) {
            uint256 adminId = adminIds[i];
            adminIdList[i] = adminId;
            balanceList[i] = admins[adminId].balance / 1 ether;
        }
        
        return (adminIdList, balanceList);
    }
    
    function viewParticipantData(uint256 participantId) external view returns (
        uint256 id,
        string memory name,
        uint256 age,
        string memory gender,
        string memory district,
        uint256 training_interest,
        bool has_completed_training,
        uint256 balance
    ) {
        require(participants[participantId].id != 0, "Participant not found");
        
        Participant memory p = participants[participantId];
        return (
            p.id,
            p.name,
            p.age,
            p.gender,
            p.district,
            uint256(p.training_interest),
            p.has_completed_training,
            p.balance
        );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        if (value < 10) return string(abi.encodePacked("0", bytes1(uint8(48 + value))));
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function viewTrainerSchedule(uint256 trainerId) external view returns (
        uint256[] memory availableSlots,
        string[] memory timeRanges
    ) {
        require(trainers[trainerId].id != 0, "Trainer not found");
        uint256 availableCount = 0;
        for (uint256 i = 0; i < TOTAL_SLOTS_PER_DAY; i++) {
            if (!trainerSlots[trainerId][i].isBooked) {
                availableCount++;
            }
        }
        availableSlots = new uint256[](availableCount);
        timeRanges = new string[](availableCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < TOTAL_SLOTS_PER_DAY; i++) {
            if (!trainerSlots[trainerId][i].isBooked) {
                availableSlots[index] = i;
                uint256 startHour = i / 2;
                uint256 startMinute = (i % 2) * 30;
                uint256 endHour = startHour;
                uint256 endMinute = startMinute + 30;
                
                if (endMinute == 60) {
                    endHour++;
                    endMinute = 0;
                }
                timeRanges[index] = string(abi.encodePacked(
                    _toString(startHour), ":", 
                    startMinute == 0 ? "00" : "30", 
                    "-",
                    _toString(endHour), ":",
                    endMinute == 0 ? "00" : "30"
                ));
                
                index++;
            }
        }
        
        return (availableSlots, timeRanges);
    }

// 🔍 Search participants by district → returns total count + sorted IDs + names
function searchParticipantsByDistrict(
    string memory district
) external view returns (
    uint256 totalInDistrict,            // total participants in the district
    uint256[] memory participantIdsSorted, // sorted list of IDs
    string[] memory participantNamesSorted // names aligned with IDs
) {
    uint256 maxIds = 100; // upper bound, adjust as needed
    uint256 matchCount = 0;

    // 1️⃣ Count matches in the given district
    for (uint256 i = 1; i <= maxIds; i++) {
        if (
            participants[i].id != 0 &&
            keccak256(bytes(participants[i].district)) == keccak256(bytes(district))
        ) {
            matchCount++;
        }
    }

    // 2️⃣ Collect IDs and names of participants in that district
    participantIdsSorted = new uint256[](matchCount);
    participantNamesSorted = new string[](matchCount);
    uint256 idx = 0;

    for (uint256 i = 1; i <= maxIds; i++) {
        if (
            participants[i].id != 0 &&
            keccak256(bytes(participants[i].district)) == keccak256(bytes(district))
        ) {
            participantIdsSorted[idx] = participants[i].id;
            participantNamesSorted[idx] = participants[i].name;
            idx++;
        }
    }

    // 3️⃣ Sort IDs (ascending) and keep names aligned
    for (uint256 i = 0; i < matchCount; i++) {
        for (uint256 j = i + 1; j < matchCount; j++) {
            if (participantIdsSorted[j] < participantIdsSorted[i]) {
                // swap IDs
                uint256 tempId = participantIdsSorted[i];
                participantIdsSorted[i] = participantIdsSorted[j];
                participantIdsSorted[j] = tempId;

                // swap names so they stay aligned
                string memory tempName = participantNamesSorted[i];
                participantNamesSorted[i] = participantNamesSorted[j];
                participantNamesSorted[j] = tempName;
            }
        }
    }

    // 4️⃣ Return total count, sorted IDs, and aligned names
    totalInDistrict = matchCount;
}


}

