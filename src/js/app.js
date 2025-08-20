App = {
    web3: null,
    account: '0x0',
    contract: null,
    contractAddress: null,
    solSource: null,

    initWeb: async function() {
        if (window.ethereum) {
            App.web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                App.account = accounts[0];
                $("#accountAddress").html(`Connected account: ${App.account}`);
            } catch (err) {
                console.error(err);
                $("#accountAddress").html("Wallet not connected");
            }
        } else alert("Install MetaMask!");
    },

    compileAndLoadContract: async function() {
        // Load deployed artifact with cache-busting to avoid stale ABI/addresses
        const artifactResponse = await fetch(`DisasterRecoveryTraining.json?t=${Date.now()}`, { cache: "no-store" });
        if (!artifactResponse.ok) {
            throw new Error("Artifact not found. Did you run truffle migrate and start the dev server?");
        }
        const artifact = await artifactResponse.json();

        const networkId = await App.web3.eth.net.getId();
        const deployed = artifact.networks && artifact.networks[networkId];
        console.log("deployed:", deployed);
        if (!deployed || !deployed.address) {
            throw new Error(`Contract not deployed on network ${networkId}. Run 'truffle migrate' on this network.`);
        }

        // Create contract instance with Web3 v4 syntax
        App.contract = new App.web3.eth.Contract(artifact.abi, deployed.address);
        console.log("artifact.abi", artifact.abi);
        console.log("deployed.address", deployed.address);
        App.contractAddress = deployed.address;
        $("#accountAddress").html(`Connected account: ${App.account}<br/>Contract: ${App.contractAddress}`);
    },

    registerAdmin: async function() {
    const id = parseInt($("#adminId").val());
    const name = $("#adminName").val();
    const age = parseInt($("#adminAge").val());

    if (!id || !name || !age) {
        alert("Please fill in all fields");
        return;
    }

    console.log("Registering admin with:", { id, name, age, account: App.account });

    try {
        const gasEstimate = await App.contract.methods.registerAdmin(id, name, age)
            .estimateGas({ from: App.account });

        const result = await App.contract.methods.registerAdmin(id, name, age)
            .send({ from: App.account, gas: gasEstimate });

        console.log("Transaction successful:", result);
        alert("Admin registered successfully!");
    } catch (err) {
        console.error("Transaction failed:", err);

        // Extract human-readable revert reason if present
        let reason = null;
        if (err.data) {
            // MetaMask / Ganache / Web3 v1+ format
            const errorData = Object.values(err.data)[0];
            if (errorData && errorData.reason) {
                reason = errorData.reason;
            }
        } else if (err.message && err.message.includes("revert")) {
            // Fallback for other revert formats
            const match = err.message.match(/revert (.*)/);
            if (match && match[1]) reason = match[1];
        }

        if (err.code === 4001) {
            alert("Transaction rejected by user in MetaMask");
        } else if (reason) {
            alert("Contract rejected transaction: " + reason);
        } else if (err.message.includes("gas")) {
            alert("Gas error: " + err.message);
        } else {
            alert("Transaction failed: " + (err.message || err.toString()));
        }
    }
},



    registerTrainer: async function() {
        const id = parseInt($("#trainerId").val());
        const name = $("#trainerName").val();
        const age = parseInt($("#trainerAge").val());
        const gender = $("#trainerGender").val();
        
        if (!id || !name || !age || !gender) {
            alert("Please fill in all fields");
            return;
        }
        
        try {
            console.log("Registering trainer with:", { id, name, age, gender, account: App.account });
            
            const result = await App.contract.methods.registerTrainer(id, name, age, gender)
                .send({ 
                    from: App.account, 
                    gas: 200000 // Fixed gas limit
                });
            console.log("Transaction result:", result);
            alert("Trainer registered successfully!");
        } catch (err) { 
            console.error("Registration error:", err); 
            let errorMsg = "Failed to register trainer";
            if (err.message) {
                errorMsg += ": " + err.message;
            } else if (err.toString) {
                errorMsg += ": " + err.toString();
            }
            alert(errorMsg); 
        }
    },

    viewTrainerSchedule: async function() {
        const trainerId = parseInt($("#viewTrainerId").val());
        const result = await App.contract.methods.viewTrainerSchedule(trainerId).call();
        const tbody = $("#trainerSchedule tbody");
        tbody.empty();
        result.availableSlots.forEach((slot, i) => {
            tbody.append(`<tr><td>${slot}</td><td>${result.timeRanges[i]}</td></tr>`);
        });
    },

    registerParticipant: async function() {
        const id = parseInt($("#participantId").val());
        const name = $("#participantName").val().trim();
        const age = parseInt($("#participantAge").val());
        const gender = $("#participantGender").val().trim();
        const district = $("#participantDistrict").val().trim();
        const training_interest = parseInt($("#participantTrainingInterest").val());

        // ✅ Basic validations
        if (!id || !name || !age || !gender || !district || isNaN(training_interest)) {
            alert("Please fill in all fields correctly.");
            return;
        }
        if (age <= 0) {
            alert("Age must be positive.");
            return;
        }
        if (training_interest < 0 || training_interest > 2) {
            alert("Invalid training interest.");
            return;
        }

        try {
            // ✅ Check if this address already has a participant ID
            // const existingId = await App.contract.methods.participantByAddress(App.account).call();
            // if (existingId != 0) {
            //     alert("This account is already registered as a participant.");
            //     return;
            // }

            console.log("Registering participant:", { id, name, age, gender, district, training_interest, account: App.account });

            // ✅ Disable button while transaction is pending
            // $("#registerParticipantBtn").prop("disabled", true);

            const gasEstimate = await App.contract.methods.registerParticipant(
                id, name, age, gender, district, training_interest, false
            ).estimateGas({ from: App.account });
            
            const result = await App.contract.methods.registerParticipant(
                id, name, age, gender, district, training_interest, false
            ).send({ 
                from: App.account, 
                gas: gasEstimate 
            });

            console.log("Transaction result:", result);
            alert("Participant registered successfully!");
        } catch (err) {
        console.error("Transaction failed:", err);

        // Extract human-readable revert reason if present
        let reason = null;
        if (err.data) {
            // MetaMask / Ganache / Web3 v1+ format
            const errorData = Object.values(err.data)[0];
            if (errorData && errorData.reason) {
                reason = errorData.reason;
            }
        } else if (err.message && err.message.includes("revert")) {
            // Fallback for other revert formats
            const match = err.message.match(/revert (.*)/);
            if (match && match[1]) reason = match[1];
        }

        if (err.code === 4001) {
            alert("Transaction rejected by user in MetaMask");
        } else if (reason) {
            alert("Contract rejected transaction: " + reason);
        } else if (err.message.includes("gas")) {
            alert("Gas error: " + err.message);
        } else {
            alert("Transaction failed: " + (err.message || err.toString()));
        }
    }
},


    viewParticipant: async function() { 
        const id = parseInt($("#viewParticipantId").val());
        const trainingTypeMap = ["First Aid", "Shelter Rebuild", "Food Safety"]; // map enum values
        try {
            const result = await App.contract.methods.viewParticipantData(id).call();
            const tbody = $("#participantInfo tbody");
            tbody.empty();

            const fields = ["ID","Name","Age","Gender","District","Training Interest","Completed","Balance"];
            fields.forEach((f,i) => {
                let value = result[i];
                // convert enum uint to string
                if(f === "Training Interest") value = trainingTypeMap[value];
                // convert boolean Completed to Yes/No
                if(f === "Completed") value = value ? "Yes" : "No";
                if(f === "Balance") value = App.web3.utils.fromWei(value, 'ether') + " ETH";

                tbody.append(`<tr><td>${f}</td><td>${value}</td></tr>`);
            });
        } catch (err) { 
            console.error(err); 
            alert("Participant not found"); 
        }
    },


    searchByDistrict: async function() {
        const district = $("#districtInput").val();
        try {
            const result = await App.contract.methods.searchParticipantsByDistrict(district).call();
            $("#totalCount").html(`Total participants in ${district}: ${result.totalInDistrict}`);
            const tbody = $("#participantsTable tbody");
            tbody.empty();
            for (let i=0; i<result.participantIdsSorted.length; i++) {
                tbody.append(`<tr><td>${result.participantIdsSorted[i]}</td><td>${result.participantNamesSorted[i]}</td></tr>`);
            }
        } catch (err) { console.error(err); alert("No participants in this district"); }
    },

    bookTrainingSlot: async function() {
        const trainerId = parseInt($("#bookTrainerId").val());
        const participantId = parseInt($("#bookParticipantId").val());
        const slotId = parseInt($("#bookSlotId").val());
        try {
            const BOOKING_FEE = App.web3.utils.toWei("1", "ether"); // match the contract

            await App.contract.methods.bookTrainingSlot(trainerId, slotId)
                .send({ from: App.account, value: BOOKING_FEE, gas: 300000 });  
            alert("Training slot booked successfully!");
        } catch (err) { console.error(err); alert("Failed to book slot: Slot Already Taken"); }
    },

    viewAdminBalances: async function() {
        try {
            const result = await App.contract.methods.viewAdminBalance().call();
            const tbody = $("#adminBalances tbody");
            tbody.empty();

            // Support both named and indexed return shapes from web3
            const adminIds = result.adminIdList || result[0] || [];
            const balances = result.balanceList || result[1] || [];

            if (!adminIds.length) {
                tbody.append(`<tr><td colspan="2">No admins registered yet</td></tr>`);
                return;
            }

            for (let i = 0; i < adminIds.length; i++) {
                tbody.append(`<tr><td>${adminIds[i]}</td><td>${balances[i]}</td></tr>`);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to load admin balances. Hard refresh the page and try again.");
        }
    },

    updateParticipantData: async function(){
        const participantId = parseInt($("#updateParticipantId").val());
    const trainingInterest = parseInt($("#updateTrainingInterest").val());
    const hasCompleted = $("#updateHasCompleted").val() === "true";

    if (!participantId || isNaN(trainingInterest)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    try {
        $("#updateParticipantBtn").prop("disabled", true);
        const result = await App.contract.methods.updateParticipantData(
            participantId,
            trainingInterest,
            hasCompleted
        ).send({ from: App.account, gas: 300000 });
        
        console.log("Update result:", result);
        $("#updateStatus").text("Participant updated successfully!").css("color", "green");
    } catch (err) {
        console.error("Update error:", err);
        let errorMsg = "Failed to update participant";
        if (err?.data?.message) errorMsg += ": " + err.data.message;
        else if (err?.message) errorMsg += ": " + err.message;
        $("#updateStatus").text(errorMsg).css("color", "red");
    } finally {
        $("#updateParticipantBtn").prop("disabled", false);
    }



    }
};

$(function() {
    $("#connectWallet").click(App.initWeb);
    $("#registerAdminBtn").click(App.registerAdmin);
    $("#registerTrainerBtn").click(App.registerTrainer);
    $("#viewTrainerScheduleBtn").click(App.viewTrainerSchedule);
    $("#registerParticipantBtn").click(App.registerParticipant);
    $("#viewParticipantBtn").click(App.viewParticipant);
    $("#searchBtn").click(App.searchByDistrict);
    $("#bookSlotBtn").click(App.bookTrainingSlot);
    $("#viewAdminBalancesBtn").click(App.viewAdminBalances);
    $("#updateParticipantBtn").click(App.updateParticipantData);
    (async () => {
        try {
            await App.initWeb();
            await App.compileAndLoadContract();
        } catch (err) {
            console.error(err);
            $("#accountAddress").html("Initialization failed. Please check your wallet/network, then click 'Connect Wallet'.");
        }
    })();
});

