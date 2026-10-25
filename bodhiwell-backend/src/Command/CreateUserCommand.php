<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Console\Helper\QuestionHelper;

#[AsCommand(name: 'app:user:create', description: 'Crea un usuario con roles privilegiados (ROLE_ADMIN / ROLE_OWNER). type_account es opcional (consultante/professional).',)] class CreateUserCommand extends Command
{
    private const ALLOWED_ROLES = ['ROLE_ADMIN', 'ROLE_OWNER'];
    private const ALLOWED_TYPES = ['patient', 'professional'];
    public function __construct(private EntityManagerInterface $em, private UserPasswordHasherInterface $hasher,)
    {
        parent::__construct();
    }
    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Email del usuario')->addOption('username', null, InputOption::VALUE_REQUIRED, 'Username (si no, se usa el email)')->addOption('first', null, InputOption::VALUE_REQUIRED, 'Nombre')->addOption('last', null, InputOption::VALUE_REQUIRED, 'Apellido')->addOption('password', null, InputOption::VALUE_REQUIRED, 'Password (si no, se solicita en modo interactivo)')->addOption('type', null, InputOption::VALUE_REQUIRED, 'type_account (opcional): consultante (usar "patient") | professional')->addOption('role', null, InputOption::VALUE_REQUIRED | InputOption::VALUE_IS_ARRAY, 'Roles a asignar (solo: ROLE_ADMIN, ROLE_OWNER)')->addOption('admin', null, InputOption::VALUE_NONE, 'Añade ROLE_ADMIN')->addOption('owner', null, InputOption::VALUE_NONE, 'Añade ROLE_OWNER')->addOption('inactive', null, InputOption::VALUE_NONE, 'Crea el usuario inactivo');
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = trim((string) $input->getArgument('email'));
        $repo = $this->em->getRepository(User::class);
        if ($repo->findOneBy(['email' => $email])) {
            $io->error('Ya existe un usuario con ese email.');
            return Command::FAILURE;
        }
        $username = trim((string) ($input->getOption('username') ?? $email));
        if ($username === '') {
            $io->error('El username no puede estar vacío.');
            return Command::FAILURE;
        }
        if ($repo->findOneBy(['username' => $username])) {
            $io->error('Ya existe un usuario con ese username.');
            return Command::FAILURE;
        }
        $first = $input->getOption('first') ?? 'User';
        $last = $input->getOption('last') ?? 'Demo';
        $type = $input->getOption('type');
        if ($type !== null) {
            $type = strtolower(trim((string)$type));
            if (!in_array($type, self::ALLOWED_TYPES, true)) {
                $io->error('type_account (si se pasa) debe ser "patient" (consultante) o "professional".');
                return Command::FAILURE;
            }
        }
        $password = $input->getOption('password');
        if (!$password) {
            if ($input->isInteractive()) {
                $q = new Question('Password (oculto): ');
                $q->setHidden(true)->setHiddenFallback(false);
                /** @var QuestionHelper $helper */ $helper = $this->getHelper('question');
                $password = (string) $helper->ask($input, $output, $q);
            } else {
                $io->error('Debe proporcionar --password en modo no interactivo.');
                return Command::FAILURE;
            }
        }
        if (strlen($password) < 8) {
            $io->error('Password requerido (mínimo 8 caracteres).');
            return Command::FAILURE;
        }
        $roles = $input->getOption('role') ?? [];
        if ($input->getOption('admin')) $roles[] = 'ROLE_ADMIN';
        if ($input->getOption('owner')) $roles[] = 'ROLE_OWNER';
        $roles = array_map([$this, 'normalizeRole'], $roles);
        $roles = array_values(array_unique($roles));
        foreach ($roles as $r) {
            if (!in_array($r, self::ALLOWED_ROLES, true)) {
                $io->error(sprintf('El rol %s no es válido para este comando. Permitidos: %s (ROLE_USER solo via panel).', $r, implode(', ', self::ALLOWED_ROLES)));
                return Command::FAILURE;
            }
        }
        if (empty($roles)) {
            $io->error('Debes asignar al menos un rol: --admin y/o --owner o --role=ROLE_ADMIN/ROLE_OWNER.');
            return Command::FAILURE;
        }
        $user = new User();
        $user->setEmail($email);
        if (method_exists($user, 'setUsername')) $user->setUsername($username);
        if (method_exists($user, 'setFirstName')) $user->setFirstName($first);
        if (method_exists($user, 'setLastName')) $user->setLastName($last);
        if ($type !== null && method_exists($user, 'setTypeAccount')) {
            $user->setTypeAccount($type);
        }

        if (method_exists($user, 'setStatus')) {
            $user->setStatus($input->getOption('inactive') ? 'inactive' : 'active');
        } elseif (method_exists($user, 'setIsActive')) {
            $user->setIsActive(!$input->getOption('inactive'));
        }
        $user->setRoles($roles);
        $hash = $this->hasher->hashPassword($user, $password);
        $user->setPassword($hash);
        $this->em->persist($user);
        $this->em->flush();
        $io->success(sprintf('Usuario creado: %s (username=%s, %s %s) type_account=%s roles=[%s]', $email, $username, $first, $last, $type ?? 'NULL', implode(', ', $roles)));
        return Command::SUCCESS;
    }
    private function normalizeRole(string $role): string
    {
        $role = strtoupper(trim($role));
        if ($role === 'OWNER') $role = 'ROLE_OWNER';
        if ($role === 'ADMIN') $role = 'ROLE_ADMIN';
        if ($role === 'USER') $role = 'ROLE_USER';
        return str_starts_with($role, 'ROLE_') ? $role : 'ROLE_' . $role;
    }
}
