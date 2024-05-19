import { useCallback } from 'react'
import useDarkMode from '@/utils/hooks/useDarkmode'
import Switcher from '@/components/ui/Switcher'
import type { ReactNode } from 'react'
import { RiMoonClearLine, RiSunLine } from 'react-icons/ri'

const withIcon = (component: ReactNode) => {
    return <div className="text-lg">{component}</div>
}
const ModeSwitcher = () => {
    const [isDark, setIsDark] = useDarkMode()

    const onSwitchChange = useCallback(
        (checked: boolean) => {
            setIsDark(checked ? 'dark' : 'light')
        },
        [setIsDark]
    )

    return (
        <div>
            <Switcher
                defaultChecked={isDark}
                unCheckedContent={withIcon(<RiMoonClearLine />)}
                checkedContent={withIcon(<RiSunLine />)}
                onChange={(checked) => onSwitchChange(checked)}
            />
        </div>
    )
}

export default ModeSwitcher
