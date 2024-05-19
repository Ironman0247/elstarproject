import SignUpForm from './SignUpForm'

const SignUp = () => {
    return (
        <>
            <div className="mb-8">
                <h3 className="mb-1">Бүртгүүлэх</h3>
                {/* <p>And lets get started with your free trial</p> */}
            </div>
            <SignUpForm disableSubmit={false} />
        </>
    )
}

export default SignUp
