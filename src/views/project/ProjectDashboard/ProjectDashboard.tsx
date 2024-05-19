import { useEffect, useState } from 'react'
import reducer, {
    getProjectDashboardData,
    useAppDispatch,
    useAppSelector,
} from './store'
import { injectReducer } from '@/store'
import Loading from '@/components/shared/Loading'
import ProjectDashboardHeader from './components/ProjectDashboardHeader'
import TaskOverview from './components/TaskOverview'
import Schedule from './components/Schedule'

injectReducer('projectDashboard', reducer)

const ProjectDashboard = () => {
    const dispatch = useAppDispatch()

    const dashboardData = useAppSelector(
        (state) => state.projectDashboard.data.dashboardData
    )

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const loading = useAppSelector(
        (state) => state.projectDashboard.data.loading
    )

    useEffect(() => {

        setSelectedDate(new Date('2020-02-02'));

        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = () => {
        dispatch(getProjectDashboardData())
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <Loading loading={loading}>
                <ProjectDashboardHeader
                />
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="flex flex-col gap-4 flex-auto">
                        <TaskOverview
                            // data={dashboardData?.projectOverviewData}

                            selectedDate={selectedDate}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="xl:w-[380px]">
                            <Schedule
                                data={dashboardData?.scheduleData}
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                            />
                        </div>
                    </div>
                </div>
            </Loading>
        </div>
    )
}

export default ProjectDashboard
