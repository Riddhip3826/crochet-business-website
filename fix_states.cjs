const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = "const [authModalOpen, setAuthModalOpen] = useState(false);\\n" +
  "  const [authEmail, setAuthEmail] = useState('');\\n" +
  "  const [authName, setAuthName] = useState('');\\n" +
  "  const [authPhone, setAuthPhone] = useState('');\\n" +
  "  const [authPassword, setAuthPassword] = useState('');\\n" +
  "  const [authOtpSent, setAuthOtpSent] = useState(false);\\n" +
  "  const [authOtp, setAuthOtp] = useState('');\\n" +
  "  const [authToken, setAuthToken] = useState(() => localStorage.getItem('softdairies_token') || '');\\n" +
  "  const [authError, setAuthError] = useState('');";

code = code.replace(/const \[authModalOpen[\s\S]*?const \[authError, setAuthError\] = useState\(''\);/, replacement);

fs.writeFileSync('src/App.tsx', code);
