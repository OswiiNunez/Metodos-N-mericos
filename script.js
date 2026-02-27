// Cargar Chart.js dinámicamente
(function loadChartJS() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    document.head.appendChild(script);
})();

// Registro de instancias de gráficas para destruirlas antes de redibujar
const chartInstances = {};

function selectMethod(method) {
    document.querySelectorAll('.method-card').forEach(card => {
        card.classList.remove('active');
    });
    
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
    
    document.getElementById('calculatorSection').classList.add('active');
    
    document.querySelectorAll('.calculator-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    document.getElementById(`${method}Panel`).classList.add('active');
    
    document.getElementById('calculatorSection').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function toggleInfo(infoId) {
    const infoBox = document.getElementById(infoId);
    infoBox.classList.toggle('active');
}

function evaluateFunction(funcStr, variables) {
    try {
        let expression = funcStr;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            expression = expression.replace(regex, `(${value})`);
        }
        return eval(expression);
    } catch (error) {
        throw new Error(`Error al evaluar la función: ${error.message}`);
    }
}

// ===== Renderizar gráfica genérica =====
function renderChart(canvasId, labels, datasets, title) {
    // Destruir instancia previa si existe
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
        delete chartInstances[canvasId];
    }

    const ctx = document.getElementById(canvasId).getContext('2d');

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc',
                        font: { family: 'Poppins', size: 13 },
                        padding: 20
                    }
                },
                title: {
                    display: true,
                    text: title,
                    color: '#60a5fa',
                    font: { family: 'Poppins', size: 16, weight: '600' },
                    padding: { bottom: 20 }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#60a5fa',
                    bodyColor: '#f8fafc',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(6)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8', font: { family: 'Poppins', size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: {
                        display: true,
                        text: 'x',
                        color: '#94a3b8',
                        font: { family: 'Poppins', size: 13 }
                    }
                },
                y: {
                    ticks: { color: '#94a3b8', font: { family: 'Poppins', size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: {
                        display: true,
                        text: 'y',
                        color: '#94a3b8',
                        font: { family: 'Poppins', size: 13 }
                    }
                }
            }
        }
    });
}

// ===== Método de Euler Mejorado =====
function calculateEuler(event) {
    event.preventDefault();
    
    const funcStr = document.getElementById('eulerFunction').value;
    const x0 = parseFloat(document.getElementById('eulerX0').value);
    const y0 = parseFloat(document.getElementById('eulerY0').value);
    const xf = parseFloat(document.getElementById('eulerXf').value);
    const h = parseFloat(document.getElementById('eulerH').value);
    
    const resultsContainer = document.getElementById('eulerResults');
    
    try {
        if (h <= 0) throw new Error('El incremento h debe ser positivo');
        if (xf <= x0) throw new Error('El valor final debe ser mayor que el inicial');
        
        const results = [];
        let x = x0;
        let y = y0;
        let n = 0;
        
        // fila 0: valores iniciales, sin k1/k2/yNext/error
        results.push({ i: 0, x: roundTo(x, 6), fxy: roundTo(y, 6), k1: '-', k2: '-', yNext: '-', error: '-' });
        
        while (x < xf - 0.0001) {
            const i = results.length - 1; // índice de la fila actual (0-based del paso)
            const fxy = y;                // f(xi, yi) = yi actual
            const k1 = evaluateFunction(funcStr, { x, y });
            const yPredictor = y + h * k1;
            const xNext = x + h;
            const k2 = evaluateFunction(funcStr, { x: xNext, y: yPredictor });
            
            const yNew = y + (h / 2) * (k1 + k2);

            // Error en notación científica igual a la imagen de referencia
            const errorVal = Math.abs(yNew) > 1e-12
                ? Math.abs((yNew - y) / yNew)
                : Math.abs(yNew - y);
            const error = errorVal.toExponential(6); // ej: 3.260000e-01

            y = yNew;
            x = xNext;
            n++;

            results.push({ 
                i:     i + 1,
                x:     roundTo(x,    6), 
                fxy:   roundTo(fxy,  6),
                k1:    roundTo(k1,   6), 
                k2:    roundTo(k2,   6),
                yNext: roundTo(y,    6),
                error
            });
        }
        
        displayEulerResults(results, funcStr);
        
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${error.message}</span>
            </div>
        `;
    }
}

function displayEulerResults(results, funcStr) {
    const container = document.getElementById('eulerResults');
    const lastResult = results[results.length - 1];
    
    container.innerHTML = `
        <div class="results-header">
            <i class="fas fa-check-circle"></i>
            <h3>Resultados del Método de Euler Mejorado</h3>
        </div>
        
        <div class="result-summary">
            <p>Función: <span class="highlight">f(x, y) = ${funcStr}</span></p>
            <p>Valor final: <span class="highlight">y(${lastResult.x}) ≈ ${lastResult.yNext}</span></p>
            <p>Número de iteraciones: <span class="highlight">${results.length - 1}</span></p>
        </div>

        <div class="chart-wrapper">
            <canvas id="eulerChart"></canvas>
        </div>
        
        <div class="table-container">
            <table class="result-table">
                <thead>
                    <tr>
                        <th>i</th>
                        <th>xᵢ</th>
                        <th>f(xᵢ, yᵢ)</th>
                        <th>k₁</th>
                        <th>k₂</th>
                        <th>yᵢ₊₁</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr>
                            <td>${r.i}</td>
                            <td>${r.x}</td>
                            <td>${r.fxy}</td>
                            <td>${r.k1}</td>
                            <td>${r.k2}</td>
                            <td>${r.yNext}</td>
                            <td>${r.error}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Datos para la gráfica
    const labels = results.map(r => typeof r.x === 'number' ? r.x.toFixed(4) : String(r.x));
    const yValues = results.map(r => typeof r.yNext === 'number' ? r.yNext : (typeof r.fxy === 'number' ? r.fxy : null));
    const predictorValues = results.map(r => typeof r.fxy === 'number' ? r.fxy : null);

    renderChart('eulerChart', labels, [
        {
            label: 'y aproximado (Euler Mejorado)',
            data: yValues,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.15)',
            pointBackgroundColor: '#60a5fa',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35
        },
        {
            label: 'ỹ predictor',
            data: predictorValues,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#f59e0b',
            pointRadius: 3,
            borderWidth: 1.5,
            borderDash: [6, 4],
            fill: false,
            tension: 0.35
        }
    ], 'Solución aproximada — Euler Mejorado (Heun)');
}

// ===== Método de Runge-Kutta (RK4) =====
function calculateRungeKutta(event) {
    event.preventDefault();
    
    const funcStr = document.getElementById('rungeFunction').value;
    const x0 = parseFloat(document.getElementById('rungeX0').value);
    const y0 = parseFloat(document.getElementById('rungeY0').value);
    const xf = parseFloat(document.getElementById('rungeXf').value);
    const h = parseFloat(document.getElementById('rungeH').value);
    
    const resultsContainer = document.getElementById('rungeResults');
    
    try {
        if (h <= 0) throw new Error('El incremento h debe ser positivo');
        if (xf <= x0) throw new Error('El valor final debe ser mayor que el inicial');
        
        const results = [];
        let x = x0;
        let y = y0;
        let n = 0;
        
        results.push({ i: 0, xi: x, k1: '-', k2: '-', k3: '-', k4: '-', yNext: y });
        
        while (x < xf - 0.0001) {
            const xi = x;
            const k1 = evaluateFunction(funcStr, { x, y });
            const k2 = evaluateFunction(funcStr, { x: x + h/2, y: y + h*k1/2 });
            const k3 = evaluateFunction(funcStr, { x: x + h/2, y: y + h*k2/2 });
            const k4 = evaluateFunction(funcStr, { x: x + h, y: y + h*k3 });
            
            y = y + (h / 6) * (k1 + 2*k2 + 2*k3 + k4);
            x = x + h;
            n++;
            
            results.push({ 
                i:     n,
                xi:    roundTo(xi, 6),
                k1:    roundTo(k1, 6), 
                k2:    roundTo(k2, 6), 
                k3:    roundTo(k3, 6), 
                k4:    roundTo(k4, 6),
                yNext: roundTo(y,  6)
            });
        }
        
        displayRungeResults(results, funcStr);
        
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${error.message}</span>
            </div>
        `;
    }
}

function displayRungeResults(results, funcStr) {
    const container = document.getElementById('rungeResults');
    const lastResult = results[results.length - 1];
    
    container.innerHTML = `
        <div class="results-header">
            <i class="fas fa-check-circle"></i>
            <h3>Resultados del Método de Runge-Kutta (RK4)</h3>
        </div>
        
        <div class="result-summary">
            <p>Función: <span class="highlight">f(x, y) = ${funcStr}</span></p>
            <p>Valor final: <span class="highlight">y(${roundTo(lastResult.xi + (results.length > 1 ? parseFloat(document.getElementById('rungeH').value) : 0), 6)}) ≈ ${lastResult.yNext}</span></p>
            <p>Número de iteraciones: <span class="highlight">${results.length - 1}</span></p>
        </div>

        <div class="chart-wrapper">
            <canvas id="rungeChart"></canvas>
        </div>
        
        <div class="table-container">
            <table class="result-table">
                <thead>
                    <tr>
                        <th>i</th>
                        <th>xᵢ</th>
                        <th>k₁</th>
                        <th>k₂</th>
                        <th>k₃</th>
                        <th>k₄</th>
                        <th>yᵢ₊₁</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr>
                            <td>${r.i}</td>
                            <td>${r.xi}</td>
                            <td>${r.k1}</td>
                            <td>${r.k2}</td>
                            <td>${r.k3}</td>
                            <td>${r.k4}</td>
                            <td>${r.yNext}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    const labels  = results.map(r => typeof r.xi === 'number' ? r.xi.toFixed(4) : String(r.xi));
    const yValues = results.map(r => typeof r.yNext === 'number' ? r.yNext : null);
    const k1Values = results.map(r => typeof r.k1 === 'number' ? r.k1 : null);

    renderChart('rungeChart', labels, [
        {
            label: 'y aproximado (RK4)',
            data: yValues,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.15)',
            pointBackgroundColor: '#34d399',
            pointRadius: 5,
            pointHoverRadius: 7,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35
        },
        {
            label: 'k₁ (pendiente inicial)',
            data: k1Values,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#f59e0b',
            pointRadius: 3,
            borderWidth: 1.5,
            borderDash: [6, 4],
            fill: false,
            tension: 0.35
        }
    ], 'Solución aproximada — Runge-Kutta de 4to Orden (RK4)');
}

// ===== Método de Newton-Raphson =====
function calculateNewtonRaphson(event) {
    event.preventDefault();
    
    const funcStr = document.getElementById('newtonFunction').value;
    const derivStr = document.getElementById('newtonDerivative').value;
    const x0 = parseFloat(document.getElementById('newtonX0').value);
    const tol = parseFloat(document.getElementById('newtonTol').value);
    const maxIter = parseInt(document.getElementById('newtonMaxIter').value);
    
    const resultsContainer = document.getElementById('newtonResults');
    
    try {
        const results = [];
        let x = x0;
        let converged = false;
        let totalIter = 0;
        
        for (let n = 0; n < maxIter; n++) {
            const fx = evaluateFunction(funcStr, { x });
            
            let fpx;
            if (derivStr.trim() === '') {
                const h = 1e-7;
                const fxPlus  = evaluateFunction(funcStr, { x: x + h });
                const fxMinus = evaluateFunction(funcStr, { x: x - h });
                fpx = (fxPlus - fxMinus) / (2 * h);
            } else {
                fpx = evaluateFunction(derivStr, { x });
            }
            
            if (Math.abs(fpx) < 1e-12) {
                throw new Error('La derivada es muy cercana a cero. Intenta con otro valor inicial.');
            }
            
            const xNew = x - fx / fpx;
            const error = Math.abs(xNew - x);

            results.push({
                iter: n + 1,
                x:    roundTo(x,    8),
                fx:   roundTo(fx,   8),
                fpx:  roundTo(fpx,  8),
                xNew: roundTo(xNew, 8),
                error: error.toExponential(2)
            });

            totalIter = n + 1;
            x = xNew;

            if (error < tol) {
                converged = true;
                break;
            }
        }
        
        displayNewtonResults(results, funcStr, derivStr, converged, tol, totalIter);
        
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${error.message}</span>
            </div>
        `;
    }
}

function displayNewtonResults(results, funcStr, derivStr, converged, tol, totalIter) {
    const container = document.getElementById('newtonResults');
    const lastResult = results[results.length - 1];
    
    const statusMessage = converged 
        ? `<p style="color: var(--success-color);">✓ Convergió en ${totalIter} iteración(es)</p>`
        : `<p style="color: var(--error-color);">✗ No convergió en el máximo de iteraciones</p>`;
    
    const derivInfo = derivStr.trim() === '' 
        ? 'Derivada: numérica (diferencia central, h = 1×10⁻⁷)' 
        : `f'(x) = ${derivStr}`;
    
    container.innerHTML = `
        <div class="results-header">
            <i class="fas fa-check-circle"></i>
            <h3>Resultados del Método de Newton-Raphson</h3>
        </div>
        
        <div class="result-summary">
            <p>Función: <span class="highlight">f(x) = ${funcStr}</span></p>
            <p>${derivInfo}</p>
            <p>Raíz encontrada: <span class="highlight">x ≈ ${lastResult.xNew}</span></p>
            <p>f(xₙ) en última iteración: <span class="highlight">${lastResult.fx}</span></p>
            <p>Tolerancia: ${tol}</p>
            ${statusMessage}
        </div>

        <div class="chart-wrapper">
            <canvas id="newtonChart"></canvas>
        </div>
        
        <div class="table-container">
            <table class="result-table">
                <thead>
                    <tr>
                        <th>Iter</th>
                        <th>xₙ</th>
                        <th>f(xₙ)</th>
                        <th>f'(xₙ)</th>
                        <th>xₙ₊₁</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr>
                            <td>${r.iter}</td>
                            <td>${r.x}</td>
                            <td>${r.fx}</td>
                            <td>${r.fpx}</td>
                            <td>${r.xNew}</td>
                            <td>${r.error}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    const iterLabels = results.map(r => `iter=${r.iter}`);
    const xValues    = results.map(r => typeof r.x  === 'number' ? r.x  : null);
    const fxValues   = results.map(r => typeof r.fx === 'number' ? r.fx : null);

    // Destruir instancia previa si existe
    if (chartInstances['newtonChart']) {
        chartInstances['newtonChart'].destroy();
        delete chartInstances['newtonChart'];
    }

    const ctx = document.getElementById('newtonChart').getContext('2d');
    chartInstances['newtonChart'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: iterLabels,
            datasets: [
                {
                    label: 'xₙ (aproximación)',
                    data: xValues,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    pointBackgroundColor: '#60a5fa',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.2,
                    yAxisID: 'y'
                },
                {
                    label: 'f(xₙ)',
                    data: fxValues,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    pointBackgroundColor: '#ef4444',
                    pointRadius: 5,
                    borderWidth: 2,
                    borderDash: [5, 3],
                    fill: false,
                    tension: 0.2,
                    yAxisID: 'y2'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeInOutQuart' },
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc',
                        font: { family: 'Poppins', size: 13 },
                        padding: 20
                    }
                },
                title: {
                    display: true,
                    text: 'Convergencia — Newton-Raphson',
                    color: '#60a5fa',
                    font: { family: 'Poppins', size: 16, weight: '600' },
                    padding: { bottom: 20 }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#60a5fa',
                    bodyColor: '#f8fafc',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8', font: { family: 'Poppins', size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'Iteración', color: '#94a3b8', font: { family: 'Poppins', size: 13 } }
                },
                y: {
                    ticks: { color: '#60a5fa', font: { family: 'Poppins', size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'xₙ', color: '#60a5fa', font: { family: 'Poppins', size: 13 } },
                    position: 'left'
                },
                y2: {
                    ticks: { color: '#ef4444', font: { family: 'Poppins', size: 11 } },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'f(xₙ)', color: '#ef4444', font: { family: 'Poppins', size: 13 } },
                    position: 'right'
                }
            }
        }
    });
}

function roundTo(num, decimals) {
    if (typeof num !== 'number' || isNaN(num)) return num;
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Calculadora de Métodos Numéricos cargada correctamente');
});