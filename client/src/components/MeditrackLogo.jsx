const MeditrackLogo = ({ className = 'h-11 w-11', title = 'Meditrack logo' }) => {
  return (
    <svg
      aria-label={title}
      className={className}
      role="img"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 5.5 52.5 13v15.4c0 13.5-8 25.2-20.5 30.1C19.5 53.6 11.5 41.9 11.5 28.4V13L32 5.5Z"
        fill="currentColor"
      />
      <path
        d="M32 12 46 17.2v11.2c0 9.8-5.4 18.3-14 22.4-8.6-4.1-14-12.6-14-22.4V17.2L32 12Z"
        fill="white"
        opacity="0.14"
      />
      <path
        d="M18.5 35.5h7.1l3.6-13 5.1 21 4.3-15 2.5 7h4.4"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M39.3 18.9c4.9-.7 7.5 1 7.1 5.9-4.7.6-7.3-1.3-7.1-5.9Z"
        fill="#A7F3D0"
      />
      <path
        d="M37.8 27.2c2.5-3.8 5.2-5.9 8.3-7.1"
        stroke="#064E3B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M23.5 17.7h7.7c2.7 0 4.8 2.1 4.8 4.8s-2.1 4.8-4.8 4.8h-7.7c-2.7 0-4.8-2.1-4.8-4.8s2.1-4.8 4.8-4.8Z"
        fill="#ECFDF5"
        opacity="0.9"
        transform="rotate(-30 27.35 22.5)"
      />
      <path
        d="M27.3 17.7v9.6"
        stroke="#047857"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
        transform="rotate(-30 27.35 22.5)"
      />
    </svg>
  );
};

export default MeditrackLogo;
