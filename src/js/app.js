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
        // Load deployed artifact instead of compiling/deploying in-browser
        const artifactResponse = await fetch("DisasterRecoveryTraining.json");
        if (!artifactResponse.ok) {
            throw new Error("Artifact not found. Did you run truffle migrate and start the dev server?");
        }
        const artifact = await artifactResponse.json();

        App.web3 = new Web3(Web3.givenProvider || window.ethereum);
        const networkId = await App.web3.eth.getChainId();
        const deployed = artifact.networks && artifact.networks[networkId];
        if (!deployed || !deployed.address) {
            throw new Error(`Contract not deployed on network ${networkId}. Run 'truffle migrate' on this network.`);
        }

        App.contract = new App.web3.eth.Contract(artifact.abi, deployed.address);
        App.contractAddress = deployed.address;
        $("#accountAddress").html(`Connected account: ${App.account}<br/>Contract: ${App.contractAddress}`);
    },

    registerAdmin: async function() {
        const id = parseInt($("#adminId").val());
        const name = $("#adminName").val();
        const age = parseInt($("#adminAge").val());
        try {
            await App.contract.methods.registerAdmin(id, name, age)
                .send({ from: App.account });
            alert("Admin registered!");
        } catch (err) { console.error(err); alert("Failed to register admin"); }
    },

    registerTrainer: async function() {
        const id = parseInt($("#trainerId").val());
        const name = $("#trainerName").val();
        const age = parseInt($("#trainerAge").val());
        const gender = $("#trainerGender").val();
        try {
            await App.contract.methods.registerTrainer(id, name, age, gender)
                .send({ from: App.account });
            alert("Trainer registered!");
        } catch (err) { console.error(err); alert("Failed to register"); }
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
        const name = $("#participantName").val();
        const age = parseInt($("#participantAge").val());
        const gender = $("#participantGender").val();
        const district = $("#participantDistrict").val();
        const training_interest = parseInt($("#participantTrainingInterest").val());
        try {
            await App.contract.methods.registerParticipant(
                id, name, age, gender, district, training_interest, false
            ).send({ from: App.account });
            alert("Participant registered!");
        } catch (err) { console.error(err); alert("Failed to register"); }
    },

    viewParticipant: async function() {
        const id = parseInt($("#viewParticipantId").val());
        try {
            const result = await App.contract.methods.viewParticipantData(id).call();
            const tbody = $("#participantInfo tbody");
            tbody.empty();
            const fields = ["ID","Name","Age","Gender","District","Training Interest","Completed","Balance"];
            fields.forEach((f,i) => tbody.append(`<tr><td>${f}</td><td>${result[i]}</td></tr>`));
        } catch (err) { console.error(err); alert("Participant not found"); }
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
            await App.contract.methods.bookTrainingSlot(trainerId, participantId, slotId)
                .send({ from: App.account, gas: 300000 });
            alert("Training slot booked successfully!");
        } catch (err) { console.error(err); alert("Failed to book slot"); }
    },

    viewAdminBalances: async function() {
        try {
            const result = await App.contract.methods.viewAdminBalance().call();
            const tbody = $("#adminBalances tbody");
            tbody.empty();
            for (let i=0; i<result.adminIdList.length; i++) {
                tbody.append(`<tr><td>${result.adminIdList[i]}</td><td>${result.balanceList[i]}</td></tr>`);
            }
        } catch(err){ console.error(err); alert("No admin balances found"); }
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

