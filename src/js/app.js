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

        
        App.contract = new App.web3.eth.Contract(artifact.abi, deployed.address);
        console.log("artifact.abi", artifact.abi);
        console.log("deployed.address", deployed.address);
        App.contractAddress = deployed.address;
        
        
        console.log("Verifying contract ABI...");
        const requiredMethods = ['getParticipantIdByAddress', 'bookTrainingSlot', 'registerAdmin', 'registerParticipant', 'registerTrainer'];
        const missingMethods = [];
        
        for (const method of requiredMethods) {
            if (!App.contract.methods[method]) {
                missingMethods.push(method);
            }
        }
        
        if (missingMethods.length > 0) {
            console.error("Missing methods in ABI:", missingMethods);
            $("#accountAddress").html(` Contract ABI outdated! Missing: ${missingMethods.join(', ')}<br/>Please run 'truffle migrate --reset'`);
            return;
        }
        
        console.log("Contract ABI verification passed");
        $("#accountAddress").html(`Connected account: ${App.account}<br/>Contract: ${App.contractAddress}<br/>ABI up-to-date`);
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

        
        let reason = null;
        if (err.data) {
            
            const errorData = Object.values(err.data)[0];
            if (errorData && errorData.reason) {
                reason = errorData.reason;
            }
        } else if (err.message && err.message.includes("revert")) {
            
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
            
            const gasEstimate = await App.contract.methods.registerTrainer(id, name, age, gender)
            .estimateGas({ from: App.account });
            const result = await App.contract.methods.registerTrainer(id, name, age, gender)
                .send({ 
                    from: App.account, 
                    gas: 200000 
                });
            console.log("Transaction result:", result);
            alert("Trainer registered successfully!");
        } catch (err) {
            console.error("Transaction failed:", err);

            
            let reason = null;
            if (err.data) {
                
                const errorData = Object.values(err.data)[0];
                if (errorData && errorData.reason) {
                    reason = errorData.reason;
                }
            } else if (err.message && err.message.includes("revert")) {
                
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

    viewTrainerSchedule: async function() {
        const trainerId = parseInt($("#viewTrainerId").val());
        const tbody = $("#trainerSchedule tbody");
        tbody.empty();

        try {
            const result = await App.contract.methods.viewTrainerSchedule(trainerId).call();

            
            const availableSlots = result.availableSlots || result[0] || [];
            const timeRanges = result.timeRanges || result[1] || [];

            if (!availableSlots || availableSlots.length === 0) {
                tbody.append(`<tr><td colspan="2">No trainer available with this id</td></tr>`);
                return;
            }

            availableSlots.forEach((slot, i) => {
                tbody.append(`<tr><td>${slot}</td><td>${timeRanges[i]}</td></tr>`);
            });

        } catch (err) {
            console.error(err);
            tbody.append(`<tr><td colspan="2">No trainer available with this id</td></tr>`);
        }
    },


    registerParticipant: async function() {
        const id = parseInt($("#participantId").val());
        const name = $("#participantName").val().trim();
        const age = parseInt($("#participantAge").val());
        const gender = $("#participantGender").val().trim();
        const district = $("#participantDistrict").val().trim();
        const hasCompletedTraining = $("#hasCompletedTraining").val() === "true"
        const training_interest = parseInt($("#participantTrainingInterest").val());

        
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
            
            
            
            
            
            

            console.log("Registering participant:", { id, name, age, gender, district, training_interest, account: App.account });

            
            

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

        
        let reason = null;
        if (err.data) {
            
            const errorData = Object.values(err.data)[0];
            if (errorData && errorData.reason) {
                reason = errorData.reason;
            }
        } else if (err.message && err.message.includes("revert")) {
            
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
        const trainingTypeMap = ["First Aid", "Shelter Rebuild", "Food Safety"]; 
        try {
            const result = await App.contract.methods.viewParticipantData(id).call();
            const tbody = $("#participantInfo tbody");
            tbody.empty();

            const fields = ["ID","Name","Age","Gender","District","Training Interest","Completed","Balance"];
            fields.forEach((f,i) => {
                let value = result[i];
                
                if(f === "Training Interest") value = trainingTypeMap[value];
                
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
        const slotId = parseInt($("#bookSlotId").val());
        
        if (!trainerId || !slotId) {
            alert("Please fill in trainer ID and slot ID");
            return;
        }
        
        try {
            console.log("=== BOOKING SLOT ===");
            console.log("Trainer ID:", trainerId);
            console.log("Slot ID:", slotId);
            console.log("Account:", App.account);
            
            
            const BOOKING_FEE = "1000000000000000000";
            console.log("Booking fee:", BOOKING_FEE, "wei");
            
            
            const balance = await App.web3.eth.getBalance(App.account);
            console.log("Account balance in ETH:", App.web3.utils.fromWei(balance, 'ether'));
            
            if (BigInt(balance) < BigInt(BOOKING_FEE)) {
                alert(" Insufficient balance! You need at least 1 ETH to book a slot.");
                return;
            }
            
            
            await App.contract.methods.bookTrainingSlot(trainerId, slotId)
                .call({ from: App.account, value: BOOKING_FEE });
            
            
            console.log("Simulation successful, sending transaction...");
            const result = await App.contract.methods.bookTrainingSlot(trainerId, slotId)
                .send({ from: App.account, value: BOOKING_FEE, gas: 400000 });
            
            console.log("Transaction successful:", result);
            alert("Training slot booked successfully!");
            
        } catch (err) {
            console.error("Simulation failed:", err.message);
            alert(" Cannot book slot: " + err.message);
        }
    },

    viewAdminBalances: async function() {
        try {
            const result = await App.contract.methods.viewAdminBalance().call();
            const tbody = $("#adminBalances tbody");
            tbody.empty();

            
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
        
        const  gasEstimate = await App.contract.methods.updateParticipantData(
            participantId,
            trainingInterest,
            hasCompleted
        ).estimateGas({ from: App.account });
        const result = await App.contract.methods.updateParticipantData(
            participantId,
            trainingInterest,
            hasCompleted
        ).send({ from: App.account, gas: 300000 });
        
        console.log("Update result:", result);
        $("#updateStatus").text("Participant updated successfully!").css("color", "green");
    } catch (err) {
        console.error("Transaction failed:", err);

        
        let reason = null;
        if (err.data) {
            
            const errorData = Object.values(err.data)[0];
            if (errorData && errorData.reason) {
                reason = errorData.reason;
            }
        } else if (err.message && err.message.includes("revert")) {
            
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

