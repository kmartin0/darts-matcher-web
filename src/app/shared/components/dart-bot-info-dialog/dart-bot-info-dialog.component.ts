import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

export interface DartBotAvgProbability {
  average: string;
  rounds: { round: string, probability: number }[];
}

@Component({
  selector: 'app-dart-bot-info-dialog',
  templateUrl: './dart-bot-info-dialog.component.html',
  styleUrls: ['./dart-bot-info-dialog.component.scss']
})
export class DartBotInfoDialogComponent implements OnInit {

  displayColumns = ['Average', 'Rounds'];

  dataSource: DartBotAvgProbability[] = [
    {average: '180 - 174', rounds: [{round: '3', probability: 100}]},
    {average: '173 - 172', rounds: [{round: '3', probability: 95}, {round: '4', probability: 5}]},
    {average: '171 - 170', rounds: [{round: '3', probability: 65}, {round: '4', probability: 35}]},
    {average: '169', rounds: [{round: '3', probability: 40}, {round: '4', probability: 60}]},
    {average: '168 - 137', rounds: [{round: '4', probability: 100}]},
    {average: '136 - 130', rounds: [{round: '4', probability: 92}, {round: '5', probability: 8}]},
    {average: '129 - 126', rounds: [{round: '4', probability: 15}, {round: '5', probability: 85}]},
    {average: '125', rounds: [{round: '4', probability: 50}, {round: '5', probability: 50}]},
    {average: '124 - 101', rounds: [{round: '5', probability: 100}]},
    {average: '100', rounds: [{round: '5', probability: 67}, {round: '6', probability: 33}]},
    {average: '99 - 84', rounds: [{round: '6', probability: 100}]},
    {average: '83', rounds: [{round: '6', probability: 40}, {round: '6', probability: 60}]},
    {average: '82 - 73', rounds: [{round: '7', probability: 100}]},
    {average: '72', rounds: [{round: '7', probability: 90}, {round: '8', probability: 10}]},
    {average: '71', rounds: [{round: '7', probability: 35}, {round: '8', probability: 65}]},
    {average: '70 - 64', rounds: [{round: '8', probability: 100}]},
    {average: '63', rounds: [{round: '8', probability: 85}, {round: '9', probability: 15}]},
    {average: '62', rounds: [{round: '8', probability: 30}, {round: '9', probability: 70}]},
    {average: '61 - 57', rounds: [{round: '9', probability: 100}]},
    {average: '56', rounds: [{round: '9', probability: 80}, {round: '10', probability: 20}]},
    {average: '55', rounds: [{round: '9', probability: 25}, {round: '10', probability: 75}]},
    {average: '54 - 51', rounds: [{round: '10', probability: 100}]},
    {average: '50', rounds: [{round: '10', probability: 60}, {round: '11', probability: 40}]},
    {average: '49 - 47', rounds: [{round: '11', probability: 100}]},
    {average: '46', rounds: [{round: '11', probability: 85}, {round: '12', probability: 15}]},
    {average: '45', rounds: [{round: '11', probability: 33}, {round: '12', probability: 67}]},
    {average: '44 - 43', rounds: [{round: '12', probability: 100}]},
    {average: '42', rounds: [{round: '12', probability: 75}, {round: '13', probability: 25}]},
    {average: '41', rounds: [{round: '12', probability: 15}, {round: '13', probability: 85}]},
    {average: '40', rounds: [{round: '13', probability: 100}]},
    {average: '39', rounds: [{round: '13', probability: 88}, {round: '14', probability: 12}]},
    {average: '38', rounds: [{round: '13', probability: 30}, {round: '14', probability: 70}]},
    {average: '37', rounds: [{round: '14', probability: 100}]},
    {average: '36', rounds: [{round: '14', probability: 80}, {round: '15', probability: 20}]},
    {average: '35', rounds: [{round: '14', probability: 15}, {round: '15', probability: 85}]},
    {average: '34', rounds: [{round: '15', probability: 95}, {round: '16', probability: 5}]},
    {average: '33', rounds: [{round: '15', probability: 40}, {round: '16', probability: 60}]},
    {average: '32', rounds: [{round: '16', probability: 95}, {round: '17', probability: 5}]},
    {average: '31', rounds: [{round: '16', probability: 40}, {round: '17', probability: 60}]},
    {average: '30', rounds: [{round: '17', probability: 90}, {round: '18', probability: 10}]},
    {average: '29', rounds: [{round: '17', probability: 30}, {round: '18', probability: 70}]},
    {average: '28', rounds: [{round: '18', probability: 90}, {round: '19', probability: 20}]},
    {average: '27', rounds: [{round: '18', probability: 10}, {round: '19', probability: 90}]},
    {average: '26', rounds: [{round: '19', probability: 40}, {round: '20', probability: 60}]},
    {average: '25', rounds: [{round: '20', probability: 70}, {round: '21', probability: 30}]},
    {average: '24', rounds: [{round: '21', probability: 20}, {round: '22', probability: 80}]},
    {average: '23', rounds: [{round: '22', probability: 85}, {round: '23', probability: 15}]},
    {
      average: '22',
      rounds: [{round: '22', probability: 70}, {round: '23', probability: 15}, {round: '23', probability: 15}]
    },
    {
      average: '21',
      rounds: [{round: '23', probability: 15}, {round: '24', probability: 15}, {round: '25', probability: 70}]
    },
    {average: '20', rounds: [{round: '25', probability: 75}, {round: '26', probability: 25}]},
    {average: '19', rounds: [{round: '26', probability: 60}, {round: '27', probability: 40}]},
    {
      average: '18',
      rounds: [{round: '27', probability: 35}, {round: '28', probability: 55}, {round: '29', probability: 10}]
    },
    {average: '17', rounds: [{round: '29', probability: 60}, {round: '30', probability: 40}]},
    {
      average: '16',
      rounds: [{round: '30', probability: 20}, {round: '31', probability: 55}, {round: '32', probability: 25}]
    },
    {
      average: '15',
      rounds: [{round: '32', probability: 25}, {round: '33', probability: 50}, {round: '34', probability: 25}]
    },
    {
      average: '14',
      rounds: [{round: '34', probability: 25}, {round: '35', probability: 50}, {round: '36', probability: 25}]
    },
    {
      average: '13',
      rounds: [{round: '37', probability: 45}, {round: '38', probability: 40}, {round: '39', probability: 15}]
    },
    {
      average: '12',
      rounds: [{round: '37', probability: 45}, {round: '38', probability: 40}, {round: '39', probability: 15}]
    },
    {
      average: '11',
      rounds: [{round: '43', probability: 35}, {round: '44', probability: 40}, {round: '45', probability: 25}]
    },
    {
      average: '10',
      rounds: [{round: '48', probability: 35}, {round: '49', probability: 25}, {round: '47', probability: 30}]
    },
    {
      average: '9',
      rounds: [{round: '52', probability: 35}, {round: '52', probability: 25}, {round: '53', probability: 30}]
    },
    {
      average: '8',
      rounds: [{round: '57', probability: 20}, {round: '58', probability: 30}, {round: '59', probability: 25}]
    },
    {
      average: '7',
      rounds: [{round: '64', probability: 20}, {round: '65', probability: 25}, {round: '66', probability: 25}]
    },
    {
      average: '6',
      rounds: [{round: '73', probability: 15}, {round: '74', probability: 20}, {round: '75', probability: 25}]
    },
    {
      average: '5',
      rounds: [{round: '86', probability: 20}, {round: '87', probability: 20}, {round: '88', probability: 20}]
    },
    {average: '4', rounds: [{round: '102-105', probability: 55}, {round: '106-110', probability: 45}]},
    {average: '3', rounds: [{round: '127-132', probability: 60}, {round: '133-140', probability: 40}]},
    {average: '2', rounds: [{round: '171-175', probability: 50}, {round: '176-190', probability: 50}]},
    {average: '1', rounds: [{round: '255-265', probability: 80}, {round: '266-288', probability: 20}]},

  ];

  ngOnInit(): void {
  }

}
