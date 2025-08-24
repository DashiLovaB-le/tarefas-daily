# Como Testar uma Aplicação Flutter (Dart)

Este guia explica como testar uma aplicação Flutter usando diferentes tipos de testes disponíveis na plataforma.

## Tipos de Testes em Flutter

### 1. Testes de Unidade (Unit Tests)
Testam funções individuais, métodos ou classes isoladamente.

#### Estrutura Básica
```dart
import 'package:test/test.dart';

void main() {
  group('Calculadora', () {
    test('deve somar dois números corretamente', () {
      final calculadora = Calculadora();
      expect(calculadora.somar(2, 3), 5);
    });
  });
}
```

#### Como Executar
```bash
flutter test
# ou para um arquivo específico
flutter test test/unit/calculadora_test.dart
```

### 2. Testes de Widget (Widget Tests)
Testam widgets individuais isoladamente, sem iniciar a aplicação completa.

#### Estrutura Básica
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:meu_app/widgets/task_card.dart';

void main() {
  testWidgets('TaskCard deve exibir título e descrição', (WidgetTester tester) async {
    // Constrói o widget
    await tester.pumpWidget(
      MaterialApp(
        home: TaskCard(
          title: 'Tarefa de teste',
          description: 'Descrição de teste',
        ),
      ),
    );

    // Verifica se o texto está presente
    expect(find.text('Tarefa de teste'), findsOneWidget);
    expect(find.text('Descrição de teste'), findsOneWidget);
  });
}
```

#### Como Executar
```bash
flutter test
# ou para um arquivo específico
flutter test test/widgets/task_card_test.dart
```

### 3. Testes de Integração (Integration Tests)
Testam o fluxo completo da aplicação, simulando a interação do usuário.

#### Estrutura Básica
```dart
// integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:meu_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Teste de fluxo completo', (WidgetTester tester) async {
    // Inicia a aplicação
    app.main();
    await tester.pumpAndSettle();

    // Interage com a aplicação
    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();

    // Verifica resultados
    expect(find.text('Nova Tarefa'), findsOneWidget);
  });
}
```

#### Como Executar
```bash
flutter test integration_test/app_test.dart
# ou para todos os testes de integração
flutter test integration_test
```

## Configuração Inicial

### 1. Adicionar Dependências
No `pubspec.yaml`:

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  test: ^1.24.0
  integration_test:
    sdk: flutter
```

### 2. Estrutura de Pastas Recomendada
```
test/
├── unit/
│   ├── models/
│   ├── services/
│   └── utils/
├── widgets/
│   ├── components/
│   └── screens/
└── integration/
    └── app_test.dart
```

## Exemplos Práticos de Testes

### Testando um Modelo de Tarefa
```dart
// test/unit/models/task_test.dart
import 'package:test/test.dart';
import 'package:meu_app/models/task.dart';

void main() {
  group('Task Model', () {
    test('deve criar uma tarefa com propriedades corretas', () {
      final task = Task(
        id: '1',
        title: 'Tarefa de teste',
        description: 'Descrição',
        priority: Priority.high,
        isCompleted: false,
      );

      expect(task.id, '1');
      expect(task.title, 'Tarefa de teste');
      expect(task.priority, Priority.high);
      expect(task.isCompleted, false);
    });

    test('deve alternar o estado de conclusão', () {
      final task = Task(
        id: '1',
        title: 'Tarefa de teste',
        isCompleted: false,
      );

      task.toggleCompleted();
      expect(task.isCompleted, true);

      task.toggleCompleted();
      expect(task.isCompleted, false);
    });
  });
}
```

### Testando um Serviço de Tarefas
```dart
// test/unit/services/task_service_test.dart
import 'package:test/test.dart';
import 'package:mockito/mockito.dart';
import 'package:meu_app/services/task_service.dart';
import 'package:meu_app/models/task.dart';

class MockTaskRepository extends Mock implements TaskRepository {}

void main() {
  late TaskService taskService;
  late MockTaskRepository mockRepository;

  setUp(() {
    mockRepository = MockTaskRepository();
    taskService = TaskService(mockRepository);
  });

  group('TaskService', () {
    test('deve adicionar uma nova tarefa', () async {
      final newTask = Task(
        id: '1',
        title: 'Nova tarefa',
        isCompleted: false,
      );

      when(mockRepository.addTask(any)).thenAnswer((_) async => newTask);

      final result = await taskService.addTask('Nova tarefa');
      
      expect(result, newTask);
      verify(mockRepository.addTask(any)).called(1);
    });
  });
}
```

### Testando um Widget de Tarefa
```dart
// test/widgets/task_card_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:meu_app/widgets/task_card.dart';
import 'package:meu_app/models/task.dart';

void main() {
  testWidgets('TaskCard mostra informações corretas', (WidgetTester tester) async {
    final task = Task(
      id: '1',
      title: 'Tarefa de teste',
      description: 'Descrição da tarefa',
      priority: Priority.medium,
      dueDate: DateTime(2024, 1, 20),
      isCompleted: false,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TaskCard(task: task),
        ),
      ),
    );

    // Verifica se os elementos estão presentes
    expect(find.text('Tarefa de teste'), findsOneWidget);
    expect(find.text('Descrição da tarefa'), findsOneWidget);
    expect(find.text('Média'), findsOneWidget);
    expect(find.text('20/01'), findsOneWidget);
    
    // Verifica se o ícone de completado NÃO está presente
    expect(find.byIcon(Icons.check_circle), findsNothing);
  });

  testWidgets('TaskCard mostra ícone quando completada', (WidgetTester tester) async {
    final task = Task(
      id: '1',
      title: 'Tarefa completada',
      isCompleted: true,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TaskCard(task: task),
        ),
      ),
    );

    // Verifica se o ícone de completado está presente
    expect(find.byIcon(Icons.check_circle), findsOneWidget);
  });
}
```

## Ferramentas e Comandos Úteis

### Comandos CLI
```bash
# Executar todos os testes
flutter test

# Executar testes com cobertura
flutter test --coverage

# Ver relatório de cobertura (requer lcov)
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html

# Executar testes em modo watch
flutter pub run test_watch --debug

# Executar testes de integração em dispositivo específico
flutter test integration_test/app_test.dart -d <device_id>
```

### Ferramentas de Mock
Adicione ao `pubspec.yaml`:
```yaml
dev_dependencies:
  mockito: ^5.4.0
  build_runner: ^2.4.0
```

Gerar mocks:
```bash
dart run build_runner build
```

### Relatórios de Cobertura
```bash
# Gera relatório de cobertura
flutter test --coverage

# Converte para HTML (requer lcov instalado)
genhtml coverage/lcov.info -o coverage/html

# Abre o relatório
open coverage/html/index.html
```

## Boas Práticas de Teste

1. **Nomes descritivos**: Use nomes claros que descrevem o que está sendo testado
2. **AAA Pattern**: Arrange, Act, Assert
3. **Testes independentes**: Cada teste deve funcionar independentemente
4. **Cobertura adequada**: Foque em testar lógica de negócio, não código trivial
5. **Mock de dependências externas**: Use mocks para serviços e repositórios
6. **Testes de borda**: Teste casos extremos e erros
7. **Manutenção**: Mantenha os testes atualizados com o código

## Ambientes de Teste

### Emuladores/Simuladores
```bash
# Listar dispositivos disponíveis
flutter devices

# Executar testes em dispositivo específico
flutter test -d <device_name>
```

### Dispositivos Físicos
1. Habilite depuração USB no dispositivo
2. Conecte via USB
3. Execute `flutter devices` para verificar
4. Execute testes com `flutter test -d <device_id>`

### CI/CD Integration
Exemplo de configuração para GitHub Actions:
```yaml
name: Flutter Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.10.0'
      - run: flutter pub get
      - run: flutter test
      - run: flutter test --coverage
```

Com essas práticas, você poderá garantir a qualidade e confiabilidade da sua aplicação Flutter.