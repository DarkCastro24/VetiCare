import React, { useState, useEffect } from 'react';
import Layout from './layout';
import { menuItemsAdmin } from '../config/layout/sidebar';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    ArcElement,
    BarElement,
    Title,
    Tooltip
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    ArcElement,
    BarElement,
    Title,
    Tooltip
);

// Para que los ejes vayan de 1 en 1
ChartJS.defaults.scales.linear.ticks.stepSize = 1;

//Para rreglar el responsive
ChartJS.defaults.maintainAspectRatio = false;

export default function Dashboard() {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const [vets, setVets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });


    const [attended, setAttended] = useState(0);
    const [pending, setPending] = useState(0);
    const [totalVets, setTotalVets] = useState(0);

    useEffect(() => {
        fetch(`${API_URL}/api/dashboard/vets/top`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(data => setVets(data))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        fetch(`${API_URL}/api/dashboard/appointments/monthly_last6months`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(DATA => {
                const monthNames = [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ];

                const labels = DATA.map(i => monthNames[i.month - 1]);
                const counts = DATA.map(i => i.count);
                setChartData({
                    labels,
                    datasets: [{
                        data: counts,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(201, 203, 207, 0.2)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                        ],
                        borderWidth: 1
                    }]
                });
            })
            .catch(console.error);
    }, [token]);

    useEffect(() => {
        fetch(`${API_URL}/api/dashboard/appointments/attended`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(d => setAttended(d.attended_appointments ?? d.count))
            .catch(console.error);

        fetch(`${API_URL}/api/dashboard/appointments/pending`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(d => setPending(d.pending_appointments ?? d.count))
            .catch(console.error);

        fetch(`${API_URL}/api/dashboard/vets/total`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(d => setTotalVets(d.total_vets ?? d.count))
            .catch(console.error);
    }, [token]);

    if (loading) return <p className="text-center my-5">Cargando datos…</p>;
    if (error) return <p className="text-danger text-center my-5">Error: {error}</p>;

    return (
        <Layout menuItems={menuItemsAdmin} userType="admin">
            <div id="admin-main-container">
                <h2 className="records-header__title mb-0 me-3" style={{
                    //backgroundColor: '#374f59',
                    height: '3rem',
                    //width: '400px',
                    color: '#374f59',
                    //padding: arriba derecha abajo izquierda;
                    //padding: '1rem 1rem 2rem 3rem',
                    //margin: '1rem 1.2rem 0.5rem 5rem',
                    margin: '1rem 9rem 1rem 2rem',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '3rem',
                    fontWeight: 600,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>Dashboard</h2>

                <div className="container-fluid px-4 py-4">


                    <div className="row g-4">
                        <div className="col-12 col-md-4 col-lg-3">
                            <div className="row row-cols-1 g-2">
                                <div className="col">
                                    <div className="card bg-white rounded-4 p-4 text-center">
                                        <h5 className="mb-2">Citas atendidas</h5>
                                        <p className="fs-3 mb-0">{attended}</p>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card bg-white rounded-4 p-4 text-center">
                                        <h5 className="mb-2">Citas pendientes</h5>
                                        <p className="fs-3 mb-0">{pending}</p>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card bg-white rounded-4 p-4 text-center">
                                        <h5 className="mb-2">Total de veterinarios</h5>
                                        <p className="fs-3 mb-0">{totalVets}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-8 col-lg-9">
                            <div className="row g-4">
                                <div className="col-12 col-lg-6">
                                    <div className="card bg-white rounded-4 p-4 h-100">
                                        <h5 className="mb-3">Desempeño de veterinarios</h5>
                                        <div className="table-responsive">
                                            <table className="table mb-0">
                                                <thead className="fw-bold">
                                                    <tr>
                                                        <th>Nombre</th>
                                                        <th className="text-end">Citas</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vets.slice(0, 5).map(v => (
                                                        <tr key={v.vet_id}>
                                                            <td className="text-truncate" style={{ maxWidth: '200px' }} >
                                                                {v.vet_name}
                                                            </td>
                                                            <td className="text-end">{v.appointments}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-6">
                                    <div className="card bg-white rounded-4 p-4 h-100">
                                        <h5 className="mb-3">
                                            Cantidad de citas por mes
                                        </h5>
                                        <div style={{ width: '100%', height: '300px' }}>
                                            <Bar data={chartData} className="w-100 h-100" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
