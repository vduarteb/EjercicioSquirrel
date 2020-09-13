class Element {
    constructor(key) {
        this.key = key;
        this.value = 1;
    }
}

class Dictionary {
    constructor() {
        this.elements = [];
    }

    pushValue(key) {
        for (let i = 0; i < this.elements.length; i++) {
            let element = this.elements[i];
            if (element.key == key) {
                element.value += 1;
                return;
            }
        }
        this.elements.push(new Element(key));
    }

    getValue(key) {
        for (let i = 0; i < this.elements.length; i++) {
            if (key == this.elements[i].key) {
                return this.elements[i].value;
            }
        }
        return 0;
    }
}

const url = "https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json"

fetch(url)
    .then(response => {
        return response.json();
    })
    .then(response => {
        let dictionary = new Dictionary();
        let keys = new Set();

        for (let i = 0; i < response.length; i++) {
            let tr = document.createElement("tr");

            let events = response[i].events;
            events.forEach(element => {
                keys.add(element);
            });

            let squirrel = response[i].squirrel;

            tr.innerHTML = `<th scope="row">${i}</th><td>${events.toString()}</td><td>${squirrel}</td>`;

            if (squirrel) {
                tr.className = "table-danger";
            }

            document.getElementsByTagName("tbody")[0].appendChild(tr);
        }

        console.log(keys);
        for (let i = 0; i < response.length; i++) {
            const events = response[i].events;
            const squirrel = response[i].squirrel;

            keys.forEach(key => {
                const existsEvent = events.find((value, index, array) => value == key) != undefined;

                if (existsEvent && squirrel) {
                    dictionary.pushValue(key + "TP");
                } else if (existsEvent && !squirrel) {
                    dictionary.pushValue(key + "FN");
                } else if (!existsEvent && squirrel) {
                    dictionary.pushValue(key + "FP");
                } else {
                    dictionary.pushValue(key + "TN");
                }
            });
        }

        let correlations = [];
        keys.forEach(key => {
            let TP = dictionary.getValue(key + "TP");
            let FN = dictionary.getValue(key + "FN");
            let FP = dictionary.getValue(key + "FP");
            let TN = dictionary.getValue(key + "TN");

            const numerator = (TP * TN) - (FP * FN);
            const denominator = Math.sqrt((TP + FP) * (TP + FN) * (TN + FP) * (TN + FN));
            const MCC = numerator / denominator;
            
            correlations.push({event: key, MCC: MCC});
        });
        console.log(correlations);
        correlations.sort((a, b) => b.MCC - a.MCC);

        for (let i = 0; i < correlations.length; i++) {
            let tr = document.createElement("tr");
            tr.innerHTML = `<th scope="row">${i}</th><td>${correlations[i].event}</td><td>${correlations[i].MCC}</td>`;

            document.getElementsByTagName("tbody")[1].appendChild(tr);
        }
    });

