import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/shared/Loading';
import { useAppSelector } from '../store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Barber, Barbershop, Schedule, createOrder, fetchBarbers, fetchBarbershops, fetchSchedules } from '../API/api';
import Button from '@/components/ui/Button'
import Modal from './Modal';
import { string } from 'yup';
import internal from 'stream';

type ProjectOverviewChart = {
    onGoing: number;
    finished: number;
    total: number;
    series: {
        name: string;
        data: number[];
    }[];
    range: string[];
};

type TaskOverviewProps = {
    data?: {
        chart?: Record<string, ProjectOverviewChart>;
    };
    className?: string;
    selectedDate?: Date | null;
};

type ChartLegendProps = {
    label: string;
    value: number;
    badgeClass?: string;
    showBadge?: boolean;
};

const ChartLegend = ({
    label,
    value,
    badgeClass,
    showBadge = true,
}: ChartLegendProps) => {
    return (
        <div className="flex gap-2">
            {showBadge && <Badge className="mt-2.5" innerClass={badgeClass} />}
            <div>
                <h5 className="font-bold">{value}</h5>
                <p>{label}</p>
            </div>
        </div>
    );
};

interface Marker {
    id: number;
    position: [number, number];
    name: string;
}

interface BarberModel {
    id: number;
    name: string;
    barbers: Barber[];
}

const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    for (let hour = startHour; hour < endHour; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        slots.push(`${time} - ${hour + 1}:00`);
    }
    return slots;
};
type ScheduleProps = {
    data?: {
        id: string;
        time: string;
        eventName: string;
        desciption: string;
        type: string;
    }[];
    selectedDate: Date | null; // Ensure selectedDate prop is defined
    //setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
};
const TaskOverview = ({ selectedDate }: { selectedDate: Date | null }) => {

    const [currentUsrId, setcurrentUsrId] = useState<Integer[]>();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [date, setDate] = useState<string | null>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [barberModels, setBarberModels] = useState<BarberModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const sideNavCollapse = useAppSelector((state) => state.theme.layout.sideNavCollapse);
    const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<Barber[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(null);
    const timeSlots = generateTimeSlots();
    useEffect(() => {
        setcurrentUsrId(1);
        console.log("selectedDate" + selectedDate?.toString());
        if (selectedDate) {
            // Convert the selectedDate to a string and set it as the value of date state
            setDate(selectedDate.toISOString());
        } else {
            // Handle the case when selectedDate is null
            setDate(null);
        }
        const fetchData = async () => {
            try {
                const barberShops = await fetchBarbershops();
                const barbers = await fetchBarbers();

                const transformedMarkers: Marker[] = barberShops.map(shop => ({
                    position: [shop.latitude, shop.longitude],
                    name: shop.name,
                    id: shop.b_shop_id,
                }));

                const groupedBarbers: BarberModel[] = barbers.reduce<BarberModel[]>((acc, barber) => {
                    const existingBarberModel = acc.find(bm => bm.id === barber.b_shop_id);
                    if (existingBarberModel) {
                        existingBarberModel.barbers.push(barber);
                    } else {
                        acc.push({ name: barber.name, id: barber.b_shop_id, barbers: [barber] });
                    }
                    return acc;
                }, []);

                setMarkers(transformedMarkers);
                setBarberModels(groupedBarbers);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [sideNavCollapse]);

    const handleMarkerClick = (name: string, id: number) => {
        setSelectedMarker(name);
        const selectedBarberModel = barberModels.find(barberModel => barberModel.id === id);
        setSelectedEmployees(selectedBarberModel ? selectedBarberModel.barbers : []);
    };

    const handleBookAppointment = (barber: Barber) => {
        setSelectedBarber(barber);
        console.log(selectedDate?.toString() + "uurchlult shaav");
        let formattedDate;
        if (selectedDate) {

            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1; // Months are zero-based, so add 1
            const day = selectedDate.getDate();
            formattedDate = `${year}-${month}-${day}`;
        }
        console.log(formattedDate); // Output: "2024 4 30"
        fetchSchedules(barber.barber_id, formattedDate || '').then((schedules) => {
            setSchedules(schedules);
            schedules.forEach((schedule) => {
                console.log(schedule);

            });
        })
            ;


        setIsModalOpen(true);

    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBarber(null);

        setSelectedTimeSlot(null); // Reset selected time slot on close
    };

    // const handleTimeSlotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setSelectedTimeSlot(event.target.value);
    // };

    const handleTimeSlotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedSlot = event.target.value; // Get the selected value
        const [selectedId, selectedDateTime] = selectedSlot.split(","); // Split the value to extract id and scheduled_datetime
        console.log("Selected Slot ID:", selectedId);
        setSelectedTimeSlot(selectedDateTime); // Set the selected time slot
        setSelectedTimeSlotId(selectedId); // Set the selected time slot id
    };

    const handleConfirmBooking = async () => {
        if (selectedTimeSlotId && selectedTimeSlot) {
            console.log("Selected Slot ID:", selectedTimeSlotId); // Log the selected slot ID
            let sel_d = new Date(selectedTimeSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await   createOrder(1 , parseInt(selectedTimeSlotId ), 0)
            alert("Selected time slot: " + sel_d);
            // 
        } else {
            console.log("Yuu ch alga.");
        }
    };



    if (isLoading) {
        return <Loading />;
    }

    return (
        <Card>
            <MapContainer
                center={[47.91639399039123, 106.90448570776461]}
                zoom={13}
                style={{ height: '400px', width: '100%', position: 'relative', zIndex: 1 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker.position}
                        eventHandlers={{
                            click: () => handleMarkerClick(marker.name, marker.id),
                        }}
                    >
                        <Popup>{marker.name}</Popup>
                    </Marker>
                ))}
            </MapContainer>
            {selectedMarker && (
                <div className="popup">
                    <div className="popup-inner">
                        <h4>Үсчингийн газрын мэдээлэл {selectedMarker}</h4>
                        <div className="flex flex-wrap">
                            {selectedEmployees.map((employee, index) => (
                                <div key={index} className="w-1/2 p-2">
                                    <div className="appointment-card">
                                        <Card>
                                            <h5>{employee.ner + ' ' + employee.ovog}</h5>
                                            <p>Zereg: {employee.zereg}</p>
                                            <p>Email: {employee.e_mail}</p>
                                            <Button onClick={() => handleBookAppointment(employee)} className="mr-2 mb-2">
                                                Цаг захиалах
                                            </Button>
                                        </Card>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {selectedBarber && (
                    <div>
                        <h4>{selectedBarber.ner + ' ' + selectedBarber.ovog} үсчин дээрх</h4>
                        <h4>Өдөр: {selectedDate?.toString()}  </h4>
                        <div>
                            <h5>Боломжит цагууд:</h5>
                            {schedules.map((slot, index) => (
                                <div key={index}>
                                    <input
                                        type="radio"
                                        id={`slot-${index}`}
                                        name="time-slot"
                                        value={`${slot.s_id},${slot.scheduled_datetime}`}
                                        // checked={selectedTimeSlot === slot}
                                        onChange={handleTimeSlotChange}

                                    />
                                    {new Date(slot.scheduled_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <Button onClick={handleConfirmBooking} disabled={!selectedTimeSlot}>
                    Захиалах
                </Button>
            </Modal>
        </Card>
    );
};

export default TaskOverview;
