const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];

const openModal = () => modal.style.display = "block";
const closeModal = () => modal.style.display = "none";

span.onclick = () => closeModal();

window.onclick = (event) => {
    if (event.target === modal) closeModal();
}

async function reduceCalculationSpeed(){
    closeModal();
    console.log("reducing the calculation speed")
    console.log("now waiting " + calculationSlowdown + "ms every " + numberOfCalculations + " operations");
    calculationSlowdown = 300;
    await domUpdate();
}
