let currentPage = 1;
const totalPages = 5;

document.getElementById('navigation').style.display = 'none'; // Initially hide the navigation

function startTutorial(path) {
    if (path === 'data-resilience') {
        currentPage = 2; // Move to the Data Resilience tutorial start
        updatePageDisplay();
        document.getElementById('navigation').style.display = 'flex'; // Show navigation
    } else if (path === 'causal-responsibility') {
        alert('Causal Responsibility content is not available yet.');
    }
}

function updatePageDisplay() {
    for (let i = 1; i <= totalPages; i++) {
        document.getElementById(`page${i}`).classList.remove('active');
    }
    document.getElementById(`page${currentPage}`).classList.add('active');
    updateButtons();
}

function updateButtons() {
    document.getElementById('prevBtn').disabled = (currentPage === 2); // Disable "Previous" on the first content page
    document.getElementById('nextBtn').disabled = (currentPage === totalPages); // Disable "Next" on the last content page
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 2 && newPage <= totalPages) {
        currentPage = newPage;
        updatePageDisplay();
    }
}

document.querySelectorAll('.clickable').forEach(row => {
    row.addEventListener('click', function() {
        this.classList.toggle('deleted');
        updateResultTable();
    });
});

document.getElementById('resetButton').addEventListener('click', function() {
    document.querySelectorAll('.deleted').forEach(el => {
        el.classList.remove('deleted');
    });
    updateResultTable();
    updateResilienceCount();
    document.getElementById('hintBox').style.display = 'none'; // Hide hint on reset
});

function updateResultTable() {
    const employees = Array.from(document.querySelectorAll('#employeesTable tr'));
    const departments = Array.from(document.querySelectorAll('#departmentsTable tr'));
    const resultTable = document.querySelector('#resultTable');

    resultTable.querySelectorAll('tr').forEach(row => {
        const empID = row.cells[0].textContent;
        const deptID = row.cells[2].textContent;

        const employeeDeleted = employees.find(r => r.cells[0].textContent === empID && r.classList.contains('deleted'));
        const departmentDeleted = departments.find(r => r.cells[0].textContent === deptID && r.classList.contains('deleted'));

        if (employeeDeleted || departmentDeleted) {
            row.classList.add('deleted');
        } else {
            row.classList.remove('deleted');
        }
    });
    updateResilienceCount(); // Update count after modifying result table
}

function updateResilienceCount() {
    const deletedEmployeeRows = document.querySelectorAll('#employeesTable .deleted').length;
    const deletedDepartmentRows = document.querySelectorAll('#departmentsTable .deleted').length;
    const totalDeletions = deletedEmployeeRows + deletedDepartmentRows;
    
    document.getElementById('resilienceCount').textContent = totalDeletions;

    // Display hint if the count is greater than 1
    if (totalDeletions > 1) {
        document.getElementById('hintBox').style.display = 'block';
    } else {
        document.getElementById('hintBox').style.display = 'none';
    }
}

function drawBridge() {
    const svg = d3.select("#bridgeVisualization")
        .append("svg")
        .attr("width", 800)
        .attr("height", 400);

    // Background
    svg.append("rect")
        .attr("width", 800)
        .attr("height", 400)
        .attr("fill", "#87CEEB"); // Sky blue background

    // River
    svg.append("rect")
        .attr("x", 0)
        .attr("y", 300)
        .attr("width", 800)
        .attr("height", 100)
        .attr("fill", "#4682B4"); // Steel blue water

    // Bridge group (only includes deck and arch)
    const bridgeGroup = svg.append("g")
        .attr("class", "bridge-group");

    // Bridge deck (rectangle)
    const bridgeDeck = bridgeGroup.append("rect")
        .attr("x", 50)
        .attr("y", 180)
        .attr("width", 700)
        .attr("height", 20)
        .attr("fill", "#8B4513");

    // Bridge arch
    const bridgeArch = bridgeGroup.append("path")
        .attr("d", "M50,180 Q400,100 750,180")
        .attr("stroke", "#A0522D")
        .attr("stroke-width", 5)
        .attr("fill", "none");

    // Pillars data
    const pillarsData = [
        {id: 'A', x: 200},
        {id: 'B', x: 400},
        {id: 'C', x: 600}
    ];

    // Drawing pillars (outside of bridge group)
    const pillars = svg.selectAll(".pillar")
        .data(pillarsData)
        .enter().append("g")
        .attr("class", "pillar")
        .attr("transform", d => `translate(${d.x}, 200)`);

    pillars.append("rect")
        .attr("x", -30)
        .attr("y", 0)
        .attr("width", 60)
        .attr("height", 150)
        .attr("fill", "#808080");

    pillars.append("path")
        .attr("d", "M-30,0 Q0,-30 30,0")
        .attr("fill", "#A9A9A9");

    pillars.append("text")
        .attr("x", 0)
        .attr("y", 180)
        .attr("text-anchor", "middle")
        .text(d => d.id)
        .attr("fill", "#333")
        .attr("font-weight", "bold");

    pillars.on("click", function(event, d) {
        const pillar = d3.select(this);
        pillar.classed("removed", !pillar.classed("removed"));
        if (pillar.classed("removed")) {
            pillar.style("opacity", 0);
        } else {
            pillar.style("opacity", 1);
        }
        checkCollapse();
    });

    function checkCollapse() {
        const remainingPillars = pillars.filter(function() { 
            return !d3.select(this).classed("removed"); 
        });

        if (remainingPillars.size() < 2 && !remainingPillars.filter(d => d.id === 'B').size()) {
            if (remainingPillars.size() === 0) {
                // No pillars remaining, translate downward
                bridgeGroup.transition()
                    .duration(2000)
                    .attr("transform", "translate(0, 150)");
            } else if (remainingPillars.data()[0].id === 'A') {
                // Only pillar A remaining, rotate right (clockwise)
                bridgeGroup.transition()
                    .duration(2000)
                    .attr("transform", `rotate(16, 200, 200)`);
            } else if (remainingPillars.data()[0].id === 'C') {
                // Only pillar C remaining, rotate left (counterclockwise)
                bridgeGroup.transition()
                    .duration(2000)
                    .attr("transform", `rotate(-16, 600, 200)`);
            }
        } else {
            // Reset to original position
            bridgeGroup.transition()
                .duration(2000)
                .attr("transform", "translate(0, 0) rotate(0)");
        }
    }
}

drawBridge();

function resetBridge() {
    d3.select("#bridgeVisualization svg").remove();
    drawBridge();
}

document.getElementById("resetBridge").addEventListener("click", resetBridge);