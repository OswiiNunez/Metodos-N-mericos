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
        
        results.push({ n, x, y, k1: '-', yPredictor: '-', k2: '-' });
        
        while (x < xf - 0.0001) {
            const k1 = evaluateFunction(funcStr, { x, y });
            const yPredictor = y + h * k1;
            
            const xNext = x + h;
            const k2 = evaluateFunction(funcStr, { x: xNext, y: yPredictor });
            
            y = y + (h / 2) * (k1 + k2);
            x = xNext;
            n++;
            
            results.push({ 
                n, 
                x: roundTo(x, 6), 
                y: roundTo(y, 6), 
                k1: roundTo(k1, 6), 
                yPredictor: roundTo(yPredictor, 6), 
                k2: roundTo(k2, 6) 
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
            <p>Valor final: <span class="highlight">y(${lastResult.x}) ≈ ${lastResult.y}</span></p>
            <p>Número de iteraciones: <span class="highlight">${results.length - 1}</span></p>
        </div>
        
        <div class="table-container">
            <table class="result-table">
                <thead>
                    <tr>
                        <th>n</th>
                        <th>xₙ</th>
                        <th>yₙ</th>
                        <th>k₁ = f(xₙ, yₙ)</th>
                        <th>ỹₙ₊₁ (predictor)</th>
                        <th>k₂ = f(xₙ₊₁, ỹₙ₊₁)</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr>
                            <td>${r.n}</td>
                            <td>${r.x}</td>
                            <td>${r.y}</td>
                            <td>${r.k1}</td>
                            <td>${r.yPredictor}</td>
                            <td>${r.k2}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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
        
        results.push({ n, x, y, k1: '-', k2: '-', k3: '-', k4: '-' });
        
        while (x < xf - 0.0001) {
            const k1 = evaluateFunction(funcStr, { x, y });
            const k2 = evaluateFunction(funcStr, { x: x + h/2, y: y + h*k1/2 });
            const k3 = evaluateFunction(funcStr, { x: x + h/2, y: y + h*k2/2 });
            const k4 = evaluateFunction(funcStr, { x: x + h, y: y + h*k3 });
            
            y = y + (h / 6) * (k1 + 2*k2 + 2*k3 + k4);
            x = x + h;
            n++;
            
            results.push({ 
                n, 
                x: roundTo(x, 6), 
                y: roundTo(y, 6), 
                k1: roundTo(k1, 6), 
                k2: roundTo(k2, 6), 
                k3: roundTo(k3, 6), 
                k4: roundTo(k4, 6) 
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
            <p>Valor final: <span class="highlight">y(${lastResult.x}) ≈ ${lastResult.y}</span></p>
            <p>Número de iteraciones: <span class="highlight">${results.length - 1}</span></p>
        </div>
        
        <div class="table-container">
            <table class="result-table">
                <thead>
                    <tr>
                        <th>n</th>
                        <th>xₙ</th>
                        <th>yₙ</th>
                        <th>k₁</th>
                        <th>k₂</th>
                        <th>k₃</th>
                        <th>k₄</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr>
                            <td>${r.n}</td>
                            <td>${r.x}</td>
                            <td>${r.y}</td>
                            <td>${r.k1}</td>
                            <td>${r.k2}</td>
                            <td>${r.k3}</td>
                            <td>${r.k4}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
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
        
        for (let n = 0; n < maxIter; n++) {
            const fx = evaluateFunction(funcStr, { x });
            
            let fpx;
            if (derivStr.trim() === '') {
                const h = 0.0001;
                const fxPlus = evaluateFunction(funcStr, { x: x + h });
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
                n,
                x: roundTo(x, 8),
                fx: roundTo(fx, 8),
                fpx: roundTo(fpx, 8),
                xNew: roundTo(xNew, 8),
                error: roundTo(error, 10)
            });
            
            if (error < tol) {
                converged = true;
                x = xNew;
                
                const fxFinal = evaluateFunction(funcStr, { x });
                results.push({
                    n: n + 1,
                    x: roundTo(x, 8),
                    fx: roundTo(fxFinal, 8),
                    fpx: '-',
                    xNew: '-',
                    error: '-'
                });
                break;
            }
            
            x = xNew;
        }
        
        displayNewtonResults(results, funcStr, derivStr, converged, tol);
        
    } catch (error) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${error.message}</span>
            </div>
        `;
    }
}

function displayNewtonResults(results, funcStr, derivStr, converged, tol) {
    const container = document.getElementById('newtonResults');
    const lastResult = results[results.length - 1];
    
    const statusMessage = converged 
        ? `<p style="color: var(--success-color);">✓ Convergió en ${results.length - 1} iteraciones</p>`
        : `<p style="color: var(--error-color);">✗ No convergió en el máximo de iteraciones</p>`;
    
    const derivInfo = derivStr.trim() === '' 
        ? 'Derivada numérica (h = 0.0001)' 
        : `f'(x) = ${derivStr}`;
    
    container.innerHTML = `
        <div class="results-header">
            <i class="fas fa-check-circle"></i>
            <h3>Resultados del Método de Newton-Raphson</h3>
        </div>
        
        <div class="result-summary">
            <p>Función: <span class="highlight">f(x) = ${funcStr}</span></p>
            <p>${derivInfo}</p>
            <p>Raíz encontrada: <span class="highlight">x ≈ ${lastResult.x}</span></p>
            <p>f(x) en la raíz: <span class="highlight">${lastResult.fx}</span></p>
            <p>Tolerancia: ${tol}</p>
            ${statusMessage}
        </div>
        
        <div class="table-container">
            <table class="result-table">
                <thead>
                    <tr>
                        <th>n</th>
                        <th>xₙ</th>
                        <th>f(xₙ)</th>
                        <th>f'(xₙ)</th>
                        <th>xₙ₊₁</th>
                        <th>Error |xₙ₊₁ - xₙ|</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr>
                            <td>${r.n}</td>
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
}

function roundTo(num, decimals) {
    if (typeof num !== 'number' || isNaN(num)) return num;
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Calculadora de Métodos Numéricos cargada correctamente');
});