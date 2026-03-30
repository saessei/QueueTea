import Logo from '/src/assets/QueueTea.png'

export const Header = () => {
  return (
    <header className='flex items-center p-2 pl-5 pb-0'>
        <img src={Logo} alt='QueueTea' className='w-14 h-auto object-contain'/>
    <span className='text-4xl pt-4 font-bold font-fredoka text-dark-brown'>QueueTea</span>
    </header>
  )
}
