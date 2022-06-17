function sortList() {
    let months = ["March", "@Jan", "Jan", "Feb", "Dec"];
    // months.sort();
    months.sort((a, b) => {
        if (a.replace(/^@/, "") === b.replace(/^@/, "")) {
            return -1;
        }
        return a.replace(/^@/, "").localeCompare(b.replace(/^@/, ""));
    });
    // months.sort((a, b) => {
    //     if (a.replace(/^@/, '') === b.replace(/^@/, '')) {
    //         return -1;
    //     }
    //     return a.replace(/^@/, '').localeCompare(b.replace(/^@/, ''));
    // });
    console.log(months);
}

function sortMap() {
    const map = {
        "@@locale": "fr",
        helloWorld: "Hello World!",
        "@helloWorld": {
            description: "The conventional newborn programmer greeting",
        },
        select: "Sélectionner",
        "@select": {
            description: "Sélectionner",
            type: "String",
        },
        all: "Tous",
        "@all": {
            description: "Tous",
            type: "String",
        },
        beginningCashBalance: "Fond de caisse initial",
        "@beginningCashBalance": {
            description: "Fond de caisse initial",
            type: "String",
        },
        continueLabel: "Continuer",
        "@continueLabel": {
            description: "Continuer",
            type: "String",
        },
        cashManagement: "Gestion du cash",
        "@cashManagement": {
            description: "Gestion du cash",
            type: "String",
            context: "",
        },
        dataSuppression: "Suppression des données",
        "@dataSuppression": {
            description: "Suppression des données",
            type: "String",
        },
    };

    const list = Object.entries(map);
    const sortByKey = (a: any, b: any) => {
        if (a[0].replace(/^@/, "") === b[0].replace(/^@/, "")) {
            return -1;
        }
        return a[0].replace(/^@/, "").localeCompare(b[0].replace(/^@/, ""));
    };
    list.sort(sortByKey);
    list.sort(sortByKey);
    console.log(list);
}

// sortList();
sortMap();