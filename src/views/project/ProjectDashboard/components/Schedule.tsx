import { useEffect, useState } from 'react'
import classNames from 'classnames'
import Card from '@/components/ui/Card'
import Calendar from '@/components/ui/Calendar'
import Badge from '@/components/ui/Badge'
import useThemeClass from '@/utils/hooks/useThemeClass'

type ScheduleProps = {
    data?: {
        id: string;
        time: string;
        eventName: string;
        desciption: string;
        type: string;
    }[];
    selectedDate: Date | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
};

const isToday = (someDate: Date) => {
    const today = new Date()
    return (
        someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear()
    )
}

const Schedule = ({ selectedDate, setSelectedDate }: ScheduleProps) => {
    const [value, setValue] = useState<Date | null>(new Date())
    useEffect(() => {
        setSelectedDate(value);
    }, [value, setSelectedDate]);

    const { textTheme } = useThemeClass()
    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    return (
        <Card className="mb-4">
            <div className="mx-auto max-w-[420px]">
                <Calendar
                    value={value}
                    dayClassName={(date, { selected }) => {
                        const defaultClass = 'text-base';

                        if (isToday(date) && !selected) {
                            return classNames(defaultClass, textTheme);
                        }

                        if (selected) {
                            return classNames(defaultClass, 'text-white');
                        }

                        return defaultClass;
                    }}
                    dayStyle={() => {
                        return { height: 48 };
                    }}
                    renderDay={(date) => {
                        const day = date.getDate();

                        if (!isToday(date)) {
                            return <span>{day}</span>;
                        }

                        return (
                            <span className="relative flex justify-center items-center w-full h-full">
                                {day}
                                <Badge className="absolute bottom-1" innerClass="h-1 w-1" />
                            </span>
                        );
                    }}
                    onChange={(val) => {
                        setValue(val);
                    }}
                />
            </div>
            <hr className="my-6" />
            {value && (
                <div>
                    <h5 className="mb-4">Таны сонгосон өдөр:</h5>
                    <p>{formatDate(value)}</p>
                </div>
            )}
        </Card>
    );
};

export default Schedule
