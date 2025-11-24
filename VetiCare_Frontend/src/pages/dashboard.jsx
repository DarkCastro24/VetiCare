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

//Para arreglar el responsive de la gráfica
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

    //Función para transformar los datos recibidos de la API a un formato compatible con Chart.js
    const transformChartData = (DATA) => {
        if (!DATA || !Array.isArray(DATA) || DATA.length === 0) {
            return { labels: [], datasets: [] };
        }

        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        //API regresa los meses de 1 a 12, asi que se mapea a -1 por el array de los nombres
        const labels = DATA.map(i => monthNames[i.month - 1]);

        const counts = DATA.map(i => i.count);
        return{
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
        };
    };

    //Componente para no repetir mensaje de falta de datos en el dashboard
    const emptyMessages = {
        atendidas: "Sin citas atendidas registradas",
        pendientes: "No hay citas pendientes",
        totalVets: "Sin veterinarios registrados",
        desempenioVets: "No se encuentra ningún veterinario registrado",
        citasxmes: "No hay datos de citas registradas por mostrar"
    };

    //Componente reutilizable para las tarjetas con los datos del dashboard
    const DashboardCard = ({ title, value, emptyMessage }) => {
        const hasData = value > 0;
        return (
            <div className="card bg-white rounded-4 p-4 text-center">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-2">{title}</h5>
                </div>
                {/*Error de hidratación arreglado con div para no tener p anidado*/}
                <div className="fs-3 mb-0">
                    {hasData ? value : <p className="fs-6 mb-0">{emptyMessage}</p>}
                </div>
            </div>
        );
    };

    useEffect(() => {
        //API envía los veterinarios con mayor citas atendidas 
        fetch(`${API_URL}/api/dashboard/vets/top`, {
            //Que se muestren los valores solo cuando se ha iniciado sesión
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(data => {
                const safeData = Array.isArray(data) ? data : [];
                setVets(safeData);
            })
            .catch(e => setError(e.message || 'Error al cargar veterinarios'))
            .finally(() => setLoading(false));
    }, [token, API_URL]);

    useEffect(() => {
        fetch(`${API_URL}/api/dashboard/appointments/monthly_last6months`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(DATA => {
                //Llamado a la función que transforma los datos para la gráfica
                const transformedData = transformChartData(DATA);
                setChartData(transformedData);

            })
            .catch(err => {
                console.error(err);
                setChartData({ labels: [], datasets: [] });
            });
    }, [token, API_URL]);

    useEffect(() => {
        fetch(`${API_URL}/api/dashboard/appointments/attended`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(d => setAttended(d.attended_appointments ?? d.count ?? 0))
            .catch(console.error);

        fetch(`${API_URL}/api/dashboard/appointments/pending`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(d => setPending(d.pending_appointments ?? d.count ?? 0))
            .catch(console.error);

        fetch(`${API_URL}/api/dashboard/vets/total`, {
            headers: { Authorization: token ? `Bearer ${token}` : '' }
        })
            .then(r => { if (!r.ok) throw r; return r.json(); })
            .then(d => setTotalVets(d.total_vets ?? d.count ?? 0))
            .catch(console.error);
    }, [token, API_URL]);

    if (loading) return <p className="text-center my-5">Cargando datos…</p>;
    if (error) return <p className="text-danger text-center my-5">Error: {error}</p>;

    const safeVets = Array.isArray(vets) ? vets : [];

    return (
        <Layout menuItems={menuItemsAdmin} userType="admin">
            <div id="admin-main-container">
                <h2 className="records-header__title mb-0 me-3" style={{
                    height: '3rem',
                    color: '#374f59',
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
                            <div className="row row-cols-1 g-2 h-100">
                                <div className="col">
                                    <DashboardCard
                                        title="Citas atendidas"
                                        value={attended}
                                        emptyMessage={emptyMessages.atendidas}
                                        icon="fas fa-calendar-check"
                                        color="primary"
                                    />
                                </div>
                                <div className="col">
                                    <DashboardCard
                                        title="Citas pendientes"
                                        value={pending}
                                        emptyMessage={emptyMessages.pendientes}
                                        icon="fas fa-calendar-clock"
                                        color="warning"
                                    />
                                </div>
                                <div className="col">
                                    <DashboardCard
                                        title="Total de veterinarios"
                                        value={totalVets}
                                        emptyMessage={emptyMessages.totalVets}
                                        icon="fas fa-user-md"
                                        color="success"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-8 col-lg-9">
                            <div className="row g-4 h-100">
                                <div className="col-12 col-lg-6 d-flex">
                                    <div className="card bg-white rounded-4 p-4 h-100 w-100">
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
                                                    {/* Slice no funciona en null y por eso falla al cargar inicialmente el dashboard vacía */}
                                                    {vets && vets.length > 0 ? (
                                                        vets.slice(0, 5).map(v => (
                                                            <tr key={v.vet_id}>
                                                                <td className="text-truncate" style={{ maxWidth: '200px' }} >
                                                                    {v.vet_name}
                                                                </td>
                                                                <td className="text-end">{v.appointments}</td>
                                                            </tr>
                                                        )
                                                        )) : (
                                                        <tr>
                                                            <td colSpan="2" className="text-center">No se encuentra ningún veterinario registrado</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-6">
                                    <div className="card bg-white rounded-4 p-4 h-100">
                                        <h5 className="mb-3"> Cantidad de citas por mes</h5>
                                        <div style={{ width: '100%', height: '300px' }}>
                                            {chartData.labels && chartData.labels.length > 0 ? (
                                                <Bar data={chartData} className="w-100 h-100" />
                                            ) : (
                                                <p className="text-center">No hay datos de citas resgistradas por mostrar</p>
                                            )}
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
